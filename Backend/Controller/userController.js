const { getPool, sql } = require('../config/db');
const { extractSkills, extractExperience, extractEducation } = require('../services/resumeParserService');

// GET /api/users/profile
// Returns the profile plus skills/experience/education parsed from the user's active resume.
const getProfile = async (req, res, next) => {
    try {
        const { user_id } = req.user; // Assuming user is authenticated and user_id is available in the request
        const pool = getPool();

        const userResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`SELECT user_id, full_name, email, role, phone, linkedin_url, github_url, portfolio_url, location FROM Users WHERE user_id = @user_id`);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.recordset[0];

        const activeResumeResult = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`SELECT resume_id, raw_text, status FROM Resumes WHERE user_id = @user_id AND is_active = 1`);

        const activeResume = activeResumeResult.recordset[0] || null;
        const rawText = activeResume?.raw_text || '';

        res.json({
            user_id:   user.user_id,
            full_name: user.full_name,
            email:     user.email,
            role:      user.role,
            contact: {
                email:     user.email,
                phone:     user.phone         || null,
                linkedin:  user.linkedin_url  || null,
                github:    user.github_url    || null,
                portfolio: user.portfolio_url || null,
                location:  user.location      || null,
            },
            active_resume_id: activeResume?.resume_id ?? null,
            skills:           rawText ? extractSkills(rawText)     : [],
            experience:       rawText ? extractExperience(rawText) : [],
            education:        rawText ? extractEducation(rawText)  : [],
        });
    } catch (error) {
        next(error);
    }
};

//PUT /api/users/profile
// Partial update: only fields actually present in the body are changed — omitted
// fields (undefined) fall through COALESCE and keep their current DB value, so a
// contact-only save (e.g. { linkedin, github, portfolio, phone, location }) can never
// clobber full_name, and vice versa. Accepts both the DB-column names
// (linkedin_url/github_url/portfolio_url) and the short contact-card names
// (linkedin/github/portfolio) for the same fields.
const updateProfile = async (req, res, next) => {
    try {
        const full_name     = req.body.full_name;
        const phone         = req.body.phone;
        const location      = req.body.location;
        const linkedin_url  = req.body.linkedin_url  ?? req.body.linkedin;
        const github_url    = req.body.github_url    ?? req.body.github;
        const portfolio_url = req.body.portfolio_url ?? req.body.portfolio;

        const pool = getPool();

        await pool.request()
            .input('full_name',     sql.VarChar, full_name     ?? null)
            .input('phone',         sql.VarChar, phone         ?? null)
            .input('linkedin_url',  sql.VarChar, linkedin_url  ?? null)
            .input('github_url',    sql.VarChar, github_url    ?? null)
            .input('portfolio_url', sql.VarChar, portfolio_url ?? null)
            .input('location',      sql.VarChar, location      ?? null)
            .input('user_id',       sql.Int,     req.user.user_id)
            .query(`
                UPDATE Users SET
                    full_name     = COALESCE(@full_name, full_name),
                    phone         = COALESCE(@phone, phone),
                    linkedin_url  = COALESCE(@linkedin_url, linkedin_url),
                    github_url    = COALESCE(@github_url, github_url),
                    portfolio_url = COALESCE(@portfolio_url, portfolio_url),
                    location      = COALESCE(@location, location)
                WHERE user_id = @user_id
            `);

        const result = await pool.request()
            .input('user_id', sql.Int, req.user.user_id)
            .query(`SELECT user_id, full_name, email, role, phone, linkedin_url, github_url, portfolio_url, location FROM Users WHERE user_id = @user_id`);

        const u = result.recordset[0];

        res.json({
            message:   'Profile updated successfully',
            user_id:   u.user_id,
            full_name: u.full_name,
            email:     u.email,
            role:      u.role,
            contact: {
                email:     u.email,
                phone:     u.phone         || null,
                linkedin:  u.linkedin_url  || null,
                github:    u.github_url    || null,
                portfolio: u.portfolio_url || null,
                location:  u.location      || null,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile };