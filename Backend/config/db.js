const sql = require('mssql');
require('dotenv').config();

const config = {
    server:process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
        trustServerCertificate: true,
        enableArithAbort: true
    },
};

let pool;

const connectDB = async ()=>{
    try{
        pool = await sql.connect(config);
        console.log('Connected to SQL Server');
        return pool;
    }catch(error){
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
const getPool = () => {
    if(!pool) throw new Error('Database not connected. Call connectDB first.');
    return pool;
};

module.exports = {
    connectDB,
    getPool,
    sql
};