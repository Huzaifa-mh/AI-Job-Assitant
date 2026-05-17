const {getPool, sql} = require('../config/db');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
    try {
        const { user_id } = req.user; // Assuming user is authenticated and user_id is available in the request
        const pool = getPool();

        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query(`SELECT user_id, full_name, email, role FROM Users WHERE user_id = @user_id`);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        next(error);
    }
};

//PUT /api/users/profile
const updateProfile = async (req, res, next) => {
    try { 
        const { full_name } = req.body;
        const pool = getPool();

        await pool.request()
            .input( 'full_name', sql.VarChar, full_name)
            .input('user_id', sql.Int, req.user.user_id)
            .query(`UPDATE Users SET full_name = @full_name WHERE user_id = @user_id`);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile };