const axios            = require('axios');
const { getPool, sql } = require('../config/db');

const FASTAPI_URL = 'http://localhost:8000';

// POST /api/match/job
// Match resume against a single job
const matchSingleJob = async (req, res, next) => {
  try {
    const { resume_id, job_id } = req.body;
    const user_id = req.user.user_id;

    if (!resume_id || !job_id)
      return res.status(400).json({ message: 'resume_id and job_id are required' });

    const response = await axios.post(`${FASTAPI_URL}/match-job`, {
      user_id,
      resume_id,
      job_id,
    });

    res.json(response.data);
  } catch (error) {
    if (error.response?.data?.detail)
      return res.status(error.response.status).json({ message: error.response.data.detail });
    next(error);
  }
};

// POST /api/match/all
// Match resume against ALL cached jobs
const matchAllJobs = async (req, res, next) => {
  try {
    const { resume_id } = req.body;
    const user_id = req.user.user_id;

    if (!resume_id)
      return res.status(400).json({ message: 'resume_id is required' });

    const response = await axios.post(`${FASTAPI_URL}/match-all-jobs`, {
      user_id,
      resume_id,
    });

    res.json(response.data);
  } catch (error) {
    if (error.response?.data?.detail)
      return res.status(error.response.status).json({ message: error.response.data.detail });
    next(error);
  }
};

// GET /api/match/results
// Get all stored match results for the logged-in user
const getMatchResults = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT
          jm.match_id,
          jm.match_score,
          jm.missing_skills,
          jm.matched_at,
          j.job_id,
          j.title,
          j.company,
          j.location,
          j.job_url
        FROM Job_Matches jm
        JOIN Jobs j ON jm.job_id = j.job_id
        WHERE jm.user_id = @user_id
        ORDER BY jm.match_score DESC
      `);

    res.json({
      total:   result.recordset.length,
      results: result.recordset,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/match/top
// Get top 5 matched jobs
const getTopMatches = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT TOP 5
          jm.match_score,
          jm.missing_skills,
          j.job_id,
          j.title,
          j.company,
          j.location,
          j.job_url,
          LEFT(j.description, 200) AS description_preview
        FROM Job_Matches jm
        JOIN Jobs j ON jm.job_id = j.job_id
        WHERE jm.user_id = @user_id
        ORDER BY jm.match_score DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
};

module.exports = { matchSingleJob, matchAllJobs, getMatchResults, getTopMatches };