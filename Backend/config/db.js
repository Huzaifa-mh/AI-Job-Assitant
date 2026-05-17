const sql = require('mssql');
require('dotenv').config();

// const config = {
//     server: process.env.DB_SERVER,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     options: {
//         trustServerCertificate: true
//     }
// };;

// 
// const config = {
//     server: process.env.DB_SERVER,   // MUHAMMADHUZAIFA\\SQLEXPRESS
//     database: process.env.DB_NAME,
//     options: {
//         trustedConnection: true,     // Windows Authentication
//         trustServerCertificate: true,
//         enableArithAbort: true,
//         instanceName: 'SQLEXPRESS',  // explicitly tell tedious the instance
//     },
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 30000,
//     },
// };


const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'SQLEXPRESS',
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
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