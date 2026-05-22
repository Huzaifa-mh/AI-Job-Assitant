const axios          = require('axios');
const { getPool, sql } = require('../config/db');
require('dotenv').config();

// POST /api/resumes/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    
    const filePath = req.file.filename; // stored file name in /uploads/
    const userId   = req.user.user_id;
    const pool     = getPool();

    // Insert resume record with status 'pending'
    const result = await pool.request()
      .input('user_id',   sql.Int,     userId)
      .input('file_path', sql.VarChar, filePath)
      .query(`
        INSERT INTO Resumes (user_id, file_path, raw_text, status)
        OUTPUT INSERTED.resume_id
        VALUES (@user_id, @file_path, NULL, 'pending')
      `);

    const resume = result.recordset[0].resume_id;

    // Tell FastAPI to process this resume asynchronously
    // We don't await this — it processes in the background
    axios.post('http://localhost:8000/process-resume', {
      resume_id: resumeId,
      file_path: filePath,
    }).catch(err => console.error('FastAPI call failed:', err.message));

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
        SELECT resume_id, file_path, status, uploaded_at
        FROM Resumes
        WHERE resume_id = @resume_id AND user_id = @user_id
      `);

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'Resume not found' });

    res.json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

// GET /api/resumes/my
const getMyResumes = async (req, res, next) => {
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('user_id', sql.Int, req.user.user_id)
      .query(`
        SELECT resume_id, file_path, status, uploaded_at
        FROM Resumes
        WHERE user_id = @user_id
        ORDER BY uploaded_at DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResumeStatus, getMyResumes };