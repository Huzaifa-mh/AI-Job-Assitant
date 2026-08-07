const axios          = require('axios');
const path            = require('path');
const fs              = require('fs');
const { getPool, sql } = require('../config/db');
require('dotenv').config();

const UPLOADS_DIR = path.join(__dirname, '../Uploads');

// The Python AI service must respond within this window — otherwise the Express
// backend would hang waiting forever and the resume would stay stuck on 'pending'.
const AI_SERVICE_TIMEOUT_MS = 60000;

// Resolves a stored file_path to an absolute path guaranteed to live inside UPLOADS_DIR,
// stripping any directory components to prevent path traversal.
const resolveUploadPath = (filePath) => path.join(UPLOADS_DIR, path.basename(filePath));

// Node wraps dual-stack connection failures (e.g. the AI service simply isn't running)
// in an AggregateError whose top-level .message is empty — unwrap it so failures are
// actually diagnosable instead of logging a blank message.
const describeAxiosError = (err) => {
  if (err.response) return `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`;
  if (err.code === 'ECONNABORTED') return 'Request timed out';
  const inner = err.cause?.errors?.[0] || err.errors?.[0];
  if (inner) return `${err.code || inner.code}: ${inner.message || inner.address + ':' + inner.port}`;
  return err.message || err.code || String(err);
};

// Best-effort extraction of profile fields from whatever shape the AI service returns
const extractProfileFields = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return {};
  return {
    full_name:     parsed.full_name || null,
    email:         parsed.email || null,
    raw_text:      parsed.raw_text || null,
    phone:         parsed.phone || null,
    linkedin_url:  parsed.links?.linkedin  || parsed.linkedin_url  || null,
    github_url:    parsed.links?.github    || parsed.github_url    || null,
    portfolio_url: parsed.links?.portfolio || parsed.portfolio_url || null,
    location:      parsed.location || parsed.address || null,
  };
};

// Fills in empty/null Users profile columns from resume-extracted data; never overwrites existing values
const fillUserProfileFromResume = async (userId, parsed) => {
  const fields = extractProfileFields(parsed);
  // full_name/email/raw_text aren't Users-profile columns handled here — only
  // guard against acting on a response that carries none of the fields we care about.
  const { phone, linkedin_url, github_url, portfolio_url, location } = fields;
  if (![phone, linkedin_url, github_url, portfolio_url, location].some(Boolean)) return;

  const pool = getPool();
  await pool.request()
    .input('user_id',       sql.Int,     userId)
    .input('phone',         sql.VarChar, fields.phone)
    .input('linkedin_url',  sql.VarChar, fields.linkedin_url)
    .input('github_url',    sql.VarChar, fields.github_url)
    .input('portfolio_url', sql.VarChar, fields.portfolio_url)
    .input('location',      sql.VarChar, fields.location)
    .query(`
      UPDATE Users SET
        phone         = COALESCE(NULLIF(phone, ''), @phone),
        linkedin_url  = COALESCE(NULLIF(linkedin_url, ''), @linkedin_url),
        github_url    = COALESCE(NULLIF(github_url, ''), @github_url),
        portfolio_url = COALESCE(NULLIF(portfolio_url, ''), @portfolio_url),
        location      = COALESCE(NULLIF(location, ''), @location)
      WHERE user_id = @user_id
    `);
};

// Flips a resume from 'pending' to 'error' — only if it's still pending, so we never
// clobber a status the AI service itself already wrote (e.g. 'processed'/'failed').
const markResumeErrored = async (resumeId) => {
  try {
    const pool = getPool();
    await pool.request()
      .input('resume_id', sql.Int, resumeId)
      .query(`UPDATE Resumes SET status = 'error' WHERE resume_id = @resume_id AND status = 'pending'`);
  } catch (dbError) {
    console.error(`Failed to mark resume ${resumeId} as errored:`, dbError.message);
  }
};

// POST /api/resume/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    const filename = req.file.filename; // stored file name in /uploads/
    const filePath = resolveUploadPath(filename); // full path
    const userId   = req.user.user_id;
    const pool     = getPool();

    // Deactivate any previously active resume for this user before inserting the new one as active
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`UPDATE Resumes SET is_active = 0 WHERE user_id = @user_id AND is_active = 1`);

    const result = await pool.request()
      .input('user_id',   sql.Int,     userId)
      .input('file_path', sql.VarChar, filename)
      .query(`
        INSERT INTO Resumes (user_id, file_path, raw_text, status, is_active)
        OUTPUT INSERTED.resume_id
        VALUES (@user_id, @file_path, NULL, 'pending', 1)
      `);

    const resumeId = result.recordset[0].resume_id;

    // Tell FastAPI to process this resume asynchronously
    // We don't await this — it processes in the background.
    // A hard timeout guarantees we never wait on a hung AI service indefinitely,
    // and the .catch guarantees the resume never stays stuck on 'pending'.
    axios.post('http://localhost:8000/process-resume', {
      resume_id: resumeId,
      file_path: filePath,
    }, { timeout: AI_SERVICE_TIMEOUT_MS })
      .then((response) => {
        const parsed = response?.data;
        if (parsed && typeof parsed === 'object') {
          fillUserProfileFromResume(userId, parsed)
            .catch(err => console.error('Profile auto-population failed:', err.message));
        }
      })
      .catch((err) => {
        console.error(`FastAPI resume processing failed (resume_id ${resumeId}): ${describeAxiosError(err)}`);
        markResumeErrored(resumeId);
      });

    res.status(201).json({
      message:   'Resume uploaded successfully. Processing started.',
      resume_id: resumeId,
      status:    'pending',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/resumes/status/:resume_id
const getResumeStatus = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('resume_id', sql.Int, req.params.resume_id)
      .input('user_id',   sql.Int, req.user.user_id)
      .query(`
        SELECT resume_id, file_path, status, is_active, uploaded_at
        FROM Resumes
        WHERE resume_id = @resume_id AND user_id = @user_id
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'Resume not found' });

    const resume = result.recordset[0];
    resume.is_active = Boolean(resume.is_active);

    res.json(resume);
  } catch (error) {
    next(error);
  }
};

// GET /api/resume, GET /api/resumes/my
// Lists all resumes for the user, indicating which one is currently active
const getMyResumes = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT resume_id, file_path, status, is_active, uploaded_at
        FROM Resumes
        WHERE user_id = @user_id
        ORDER BY uploaded_at DESC
      `);

    const resumes = result.recordset.map(r => ({ ...r, is_active: Boolean(r.is_active) }));

    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/resume/:id/activate
// Sets the given resume as the user's active resume, deactivating all others
const activateResume = async (req, res, next) => {
  try {
    const userId   = req.user.user_id;
    const resumeId = req.params.id;
    const pool     = getPool();

    const existing = await pool.request()
      .input('resume_id', sql.Int, resumeId)
      .input('user_id',   sql.Int, userId)
      .query(`SELECT resume_id FROM Resumes WHERE resume_id = @resume_id AND user_id = @user_id`);

    if (existing.recordset.length === 0)
      return res.status(404).json({ message: 'Resume not found' });

    await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`UPDATE Resumes SET is_active = 0 WHERE user_id = @user_id AND is_active = 1`);

    await pool.request()
      .input('resume_id', sql.Int, resumeId)
      .input('user_id',   sql.Int, userId)
      .query(`UPDATE Resumes SET is_active = 1 WHERE resume_id = @resume_id AND user_id = @user_id`);

    res.json({ message: 'Resume activated successfully', resume_id: Number(resumeId) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/resume/:id
const deleteResume = async (req, res, next) => {
  try {
    const userId   = req.user.user_id;
    const resumeId = req.params.id;
    const pool     = getPool();

    const existing = await pool.request()
      .input('resume_id', sql.Int, resumeId)
      .input('user_id',   sql.Int, userId)
      .query(`SELECT resume_id, file_path, is_active FROM Resumes WHERE resume_id = @resume_id AND user_id = @user_id`);

    if (existing.recordset.length === 0)
      return res.status(404).json({ message: 'Resume not found' });

    const resume = existing.recordset[0];

    // File system cleanup — never let a missing/locked file block the DB deletion
    try {
      const absolutePath = resolveUploadPath(resume.file_path);
      await fs.promises.unlink(absolutePath);
    } catch (fileError) {
      if (fileError.code === 'ENOENT')
        console.warn(`Resume file not found on disk (resume_id ${resumeId}): ${resume.file_path}`);
      else
        console.warn(`Failed to delete resume file (resume_id ${resumeId}):`, fileError.message);
    }

    await pool.request()
      .input('resume_id', sql.Int, resumeId)
      .input('user_id',   sql.Int, userId)
      .query(`DELETE FROM Resumes WHERE resume_id = @resume_id AND user_id = @user_id`);

    let newActiveResumeId = null;

    if (Boolean(resume.is_active)) {
      const nextActive = await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT TOP 1 resume_id FROM Resumes
          WHERE user_id = @user_id
          ORDER BY uploaded_at DESC
        `);

      if (nextActive.recordset.length > 0) {
        newActiveResumeId = nextActive.recordset[0].resume_id;
        await pool.request()
          .input('resume_id', sql.Int, newActiveResumeId)
          .input('user_id',   sql.Int, userId)
          .query(`UPDATE Resumes SET is_active = 1 WHERE resume_id = @resume_id AND user_id = @user_id`);
      }
    }

    const remaining = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT resume_id, file_path, status, is_active, uploaded_at
        FROM Resumes
        WHERE user_id = @user_id
        ORDER BY uploaded_at DESC
      `);

    res.json({
      message:              'Resume deleted successfully',
      deleted_resume_id:    Number(resumeId),
      new_active_resume_id: newActiveResumeId,
      resumes:              remaining.recordset.map(r => ({ ...r, is_active: Boolean(r.is_active) })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResumeStatus, getMyResumes, activateResume, deleteResume };
