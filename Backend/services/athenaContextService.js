const { getPool, sql } = require('../config/db');

// Keeps the resume text sent to the AI provider within a sane prompt-size budget.
const RESUME_CHAR_BUDGET = 4000;

// Builds the RAG context for Athena from data the app already has for this user —
// profile, latest resume, top job matches (and the skills already extracted onto
// them by the matcher), and recent proposals/cover letters.
const buildUserContext = async (user_id) => {
  const pool = getPool();

  const [profileResult, resumeResult, matchesResult, proposalsResult] = await Promise.all([
    pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`SELECT full_name, email, role FROM Users WHERE user_id = @user_id`),

    pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT TOP 1 resume_id, status, raw_text
        FROM Resumes
        WHERE user_id = @user_id
        ORDER BY uploaded_at DESC
      `),

    pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT TOP 5
          jm.match_score, jm.missing_skills, jm.matched_skills,
          j.title, j.company
        FROM Job_Matches jm
        JOIN Jobs j ON jm.job_id = j.job_id
        WHERE jm.user_id = @user_id
        ORDER BY jm.match_score DESC
      `),

    pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT TOP 3
          p.proposal_type, p.status, j.title AS job_title, j.company
        FROM Proposals p
        JOIN Jobs j ON p.job_id = j.job_id
        WHERE p.user_id = @user_id
        ORDER BY p.created_at DESC
      `),
  ]);

  const profile = profileResult.recordset[0] || null;

  const resumeRow = resumeResult.recordset[0] || null;
  const resume = resumeRow ? {
    status: resumeRow.status,
    raw_text: resumeRow.raw_text ? resumeRow.raw_text.slice(0, RESUME_CHAR_BUDGET) : null,
  } : null;

  const top_matches = matchesResult.recordset.map(m => ({
    title: m.title,
    company: m.company,
    match_score: m.match_score,
    matched_skills: JSON.parse(m.matched_skills || '[]'),
    missing_skills: JSON.parse(m.missing_skills || '[]'),
  }));

  // No standalone "extracted skills" table is populated anywhere in the app today —
  // the matcher computes matched skills per job-match, so that's the real data to reuse.
  const skills = [...new Set(top_matches.flatMap(m => m.matched_skills))]
    .map(skill_name => ({ skill_name }));

  const recent_proposals = proposalsResult.recordset.map(p => ({
    proposal_type: p.proposal_type,
    status: p.status,
    job_title: p.job_title,
    company: p.company,
  }));

  return { profile, resume, skills, top_matches, recent_proposals };
};

module.exports = { buildUserContext };
