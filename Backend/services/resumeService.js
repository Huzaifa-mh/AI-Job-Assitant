const { getPool, sql } = require('../config/db');

// Returns the resume_id of the user's currently active resume, or null if none is set active.
const getActiveResumeId = async (user_id) => {
  const pool = getPool();
  const result = await pool.request()
    .input('user_id', sql.Int, user_id)
    .query(`SELECT resume_id FROM Resumes WHERE user_id = @user_id AND is_active = 1`);

  return result.recordset[0]?.resume_id ?? null;
};

module.exports = { getActiveResumeId };
