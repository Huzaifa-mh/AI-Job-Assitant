const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) =>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ message:'Not authorized, no token'});
    }

    const token = authHeader.split(' ')[1];

    //Debuging
    // console.log('Token:', token); // Debugging log to check the token value
    // console.log(req.headers.authorization);
    // console.log(process.env.JWT_SECRET);

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({ message:'Not authorized, invalid token'});
    }
};

module.exports = { protect };