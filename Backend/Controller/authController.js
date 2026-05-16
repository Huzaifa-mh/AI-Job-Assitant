const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {getPool, sql} = require("../config/db");
require('dotenv').config();

const generateToken = (user_id, email) =>{
    return jwt.sign({user_id, email}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN ,
    });
};

//POST api request to register a new user /api/auth/register
const register = async(req, res,next) => {
    try{
        const { full_name, email, password } = req.body;

        if(!full_name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }
        const pool = getPool();

        // to check if the email is already registered or not 
        const existing = await pool.request().input('email', sql.VarChar, email).query('SELECT user_id from Users where email = @email');

        if(existing.recordset.length > 0){
            return res.status(400).json({message: 'Email already registered'});
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.request()
            .input('full_name', sql.VarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.VarChar, password_hash)
            .query(`INSERT INTO Users (full_name, email, password_hash) 
                OUTPUT INSERTED.user_id, INSERTED.full_name,
                INSERTED.email VALUES (@full_name, @email, @password_hash)`);

        const user = result.recordset[0];
        const token = generateToken(user.user_id, user.email);

        res.status(201).json({user, token});
    }catch(error){
        next(error);
    }
};

// post request for the user login /api/auth/login
const login = async(req, res, next) => {
    try{
        const { email, pasword } = req.body;
        if(!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }
            const pool = getPool();

            const result = await pool.request()
                .input('email', sql.VarChar, email)
                .query(`Select * from Users where email = @email`);

                if(result.recordset.length === 0){
                    return res.status(401).json({message: 'Invalid email or password'});
                }

                const user = result.recordset[0];
                const isMatch = await bcrypt.compare(password, user.password_hash);

                if(!isMatch)
                    return res.status(401).json({message: "Invalid email or password"});

                const token = generateToken(user.user_id, user.email);

                res.json({
                    user: {
                        user_id: user.user_id,
                        full_name: user.full_name,
                        email: user.email,
                        role: user.role
                    },
                    token,
                });
            
    }catch(error){
        next(error);
    }
}

module.exports = { register, login};