const axios            = require('axios');
const { getPool, sql } = require('../config/db');

const PLAYWRIGHT_URL = 'http://localhost:8001';
const FASTAPI_URL    = 'http://localhost:8000';

// POST /api/apply/scan
// Step 1: scan the form fields from the job URL
const scanJobForm = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    if (!job_id)
      return res.status(400).json({ message: 'job_id is required' });

    // Get job URL from DB
    const pool   = getPool();
    const result = await pool.request()
      .input('job_id', sql.Int, job_id)
      .query('SELECT job_id, title, company, job_url FROM Jobs WHERE job_id = @job_id');

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'Job not found' });

    const job = result.recordset[0];

    if (!job.job_url)
      return res.status(400).json({ message: 'This job has no apply URL' });

    // Send to Playwright service
    const scanResult = await axios.post(`${PLAYWRIGHT_URL}/scan-form`, {
      url: job.job_url,
    });

    res.json({
      job_id:     job.job_id,
      job_title:  job.title,
      company:    job.company,
      job_url:    job.job_url,
      scan:       scanResult.data,
    });

  } catch (error) {
    if (error.response?.data)
      return res.status(error.response.status).json(error.response.data);
    next(error);
  }
};

// POST /api/apply/map-fields
// Step 2: AI maps resume data to the scanned fields
const mapFormFields = async (req, res, next) => {
  try {
    const { resume_id, fields } = req.body;
    const user_id = req.user.user_id;

    if (!resume_id || !fields)
      return res.status(400).json({ message: 'resume_id and fields are required' });

    const response = await axios.post(`${FASTAPI_URL}/map-form-fields`, {
      user_id,
      resume_id,
      fields,
    });

    res.json(response.data);

  } catch (error) {
    if (error.response?.data?.detail)
      return res.status(error.response.status).json({ message: error.response.data.detail });
    next(error);
  }
};

module.exports = { scanJobForm, mapFormFields };