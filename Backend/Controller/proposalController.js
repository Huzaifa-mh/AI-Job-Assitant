const axios            = require('axios');
const { getPool, sql } = require('../config/db');
const { getActiveResumeId } = require('../services/resumeService');

const FASTAPI_URL = 'http://localhost:8000';

// POST /api/proposals/generate
// Calls the FastAPI DeepSeek proposal generator using the user's active resume.
// Not persisted — the user saves explicitly.
const generateProposal = async (req, res, next) => {
  try {
    const { job_id, content_type } = req.body;
    const user_id = req.user.user_id;

    if (!job_id || !content_type)
      return res.status(400).json({ message: 'job_id and content_type are required' });

    const resume_id = await getActiveResumeId(user_id);
    if (!resume_id)
      return res.status(400).json({ message: 'Please select or upload an active resume.' });

    const response = await axios.post(`${FASTAPI_URL}/generate-proposal`, {
      user_id,
      resume_id,
      job_id,
      content_type,
    });

    res.json(response.data);
  } catch (error) {
    if (error.response?.data?.detail)
      return res.status(error.response.status).json({ message: error.response.data.detail });
    next(error);
  }
};

// POST /api/proposals
// Saves an edited/generated proposal as a draft
const saveProposal = async (req, res, next) => {
  try {
    const { job_id, proposal_type, proposal_text } = req.body;
    const user_id = req.user.user_id;

    if (!job_id || !proposal_type || !proposal_text)
      return res.status(400).json({ message: 'job_id, proposal_type and proposal_text are required' });

    const pool = getPool();
    const result = await pool.request()
      .input('user_id',       sql.Int,      user_id)
      .input('job_id',        sql.Int,      job_id)
      .input('proposal_type', sql.VarChar,  proposal_type)
      .input('proposal_text', sql.NVarChar, proposal_text)
      .query(`
        INSERT INTO Proposals (user_id, job_id, proposal_type, proposal_text)
        OUTPUT INSERTED.proposal_id, INSERTED.status, INSERTED.created_at
        VALUES (@user_id, @job_id, @proposal_type, @proposal_text)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

// GET /api/proposals
// Lists the logged-in user's saved proposals
const getMyProposals = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT
          p.proposal_id,
          p.proposal_type,
          p.proposal_text,
          p.status,
          p.created_at,
          j.job_id,
          j.title   AS job_title,
          j.company
        FROM Proposals p
        JOIN Jobs j ON p.job_id = j.job_id
        WHERE p.user_id = @user_id
        ORDER BY p.created_at DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateProposal, saveProposal, getMyProposals };
