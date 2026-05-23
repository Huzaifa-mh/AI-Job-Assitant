const { getPool, sql }      = require('../config/db');
const { fetchLinkedInJobs } = require('../services/linkedinService');

// POST /api/jobs/fetch
// Fetches from RapidAPI and caches into SQL Server
const fetchAndStoreJobs = async (req, res, next) => {
  try {
    const { title_filter , location_filter, limit = 10 } = req.body;

    // 1. Pull jobs from LinkedIn via RapidAPI
    const jobs = await fetchLinkedInJobs(title_filter, location_filter, limit);

    if (!jobs || jobs.length === 0)
      return res.status(404).json({ message: 'No jobs returned from API' });

    const pool = getPool();
    let inserted = 0;
    let skipped  = 0;

    // 2. Store each job in SQL Server (skip duplicates by URL)
    for (const job of jobs) {
      // Check if this job URL already exists
      const exists = await pool.request()
        .input('job_url', sql.VarChar, job.job_url)
        .query('SELECT job_id FROM Jobs WHERE job_url = @job_url');

      if (exists.recordset.length > 0) {
        skipped++;
        continue;
      }

      await pool.request()
        .input('title',       sql.VarChar,      job.title)
        .input('company',     sql.VarChar,      job.company)
        .input('location',    sql.VarChar,      job.location)
        .input('description', sql.NVarChar,     job.description)
        .input('job_url',     sql.VarChar,      job.job_url)
        .input('source',      sql.VarChar,      'linkedin')
        .query(`
          INSERT INTO Jobs (title, company, location, description, job_url, source)
          VALUES (@title, @company, @location, @description, @job_url, @source)
        `);

      inserted++;
    }

    res.status(201).json({
      message:  `Jobs fetched and cached successfully`,
      inserted,
      skipped,
      total_received: jobs.length,
    });
  } catch (error) {
    // If RapidAPI itself fails, give a clear message
    if (error.response?.status === 403)
      return res.status(403).json({ message: 'Invalid RapidAPI key or host' });
    if (error.response?.status === 429)
      return res.status(429).json({ message: 'RapidAPI rate limit reached. Try again later.' });
    next(error);
  }
};

// GET /api/jobs
// Returns all cached jobs with optional search filter
const getAllJobs = async (req, res, next) => {
  try {
    const { search = '', location = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const pool   = getPool();

    const result = await pool.request()
      .input('search',   sql.VarChar, `%${search}%`)
      .input('location', sql.VarChar, `%${location}%`)
      .input('limit',    sql.Int,     parseInt(limit))
      .input('offset',   sql.Int,     parseInt(offset))
      .query(`
        SELECT
          job_id, title, company, location,
          LEFT(description, 300) AS description_preview,
          job_url, source, fetched_at
        FROM Jobs
        WHERE
          (title       LIKE @search   OR
           company     LIKE @search   OR
           description LIKE @search)
          AND location LIKE @location
        ORDER BY fetched_at DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

    // Total count for pagination
    const countResult = await pool.request()
      .input('search',   sql.VarChar, `%${search}%`)
      .input('location', sql.VarChar, `%${location}%`)
      .query(`
        SELECT COUNT(*) AS total FROM Jobs
        WHERE
          (title LIKE @search OR company LIKE @search OR description LIKE @search)
          AND location LIKE @location
      `);

    const total = countResult.recordset[0].total;

    res.json({
      jobs:        result.recordset,
      total,
      page:        parseInt(page),
      total_pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:jobId
// Returns a single job with full description
const getJobById = async (req, res, next) => {
  try {
    const pool   = getPool();
    const result = await pool.request()
      .input('job_id', sql.Int, req.params.jobId)
      .query('SELECT * FROM Jobs WHERE job_id = @job_id');

    if (result.recordset.length === 0)
      return res.status(404).json({ message: 'Job not found' });

    res.json(result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/jobs/clear
// Clears old cached jobs (useful for refreshing data)
const clearOldJobs = async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.request().query(`
      DELETE FROM Jobs
      WHERE fetched_at < DATEADD(day, -3, GETDATE())
    `);
    res.json({ message: 'Jobs older than 3 days cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchAndStoreJobs, getAllJobs, getJobById, clearOldJobs };