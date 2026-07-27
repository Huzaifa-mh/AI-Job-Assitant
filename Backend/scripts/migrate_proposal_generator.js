// One-off migration for the Proposal Generator feature.
// Run with: node scripts/migrate_proposal_generator.js
const sql = require('mssql');
require('dotenv').config();

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
};

const statements = [
  `IF COL_LENGTH('Jobs', 'company_logo') IS NULL ALTER TABLE Jobs ADD company_logo NVARCHAR(500) NULL`,
  `IF COL_LENGTH('Jobs', 'employment_type') IS NULL ALTER TABLE Jobs ADD employment_type VARCHAR(50) NULL`,
  `IF COL_LENGTH('Jobs', 'salary') IS NULL ALTER TABLE Jobs ADD salary NVARCHAR(100) NULL`,
  `IF COL_LENGTH('Job_Matches', 'matched_skills') IS NULL ALTER TABLE Job_Matches ADD matched_skills NVARCHAR(MAX) NULL`,
  `IF OBJECT_ID('Proposals', 'U') IS NULL
   CREATE TABLE Proposals (
     proposal_id INT IDENTITY PRIMARY KEY,
     user_id INT NOT NULL FOREIGN KEY REFERENCES Users(user_id),
     job_id INT NOT NULL FOREIGN KEY REFERENCES Jobs(job_id),
     proposal_type VARCHAR(20) NOT NULL,
     proposal_text NVARCHAR(MAX) NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'draft',
     created_at DATETIME NOT NULL DEFAULT GETDATE()
   )`,
  // Covers the case where Proposals already existed (e.g. an earlier ERD-only table) without this column
  `IF COL_LENGTH('Proposals', 'proposal_type') IS NULL
   ALTER TABLE Proposals ADD proposal_type VARCHAR(20) NOT NULL CONSTRAINT DF_Proposals_proposal_type DEFAULT 'proposal'`,
];

(async () => {
  try {
    const pool = await sql.connect(config);
    for (const statement of statements) {
      await pool.request().query(statement);
      console.log('OK:', statement.split('\n')[0].slice(0, 80));
    }
    console.log('Migration complete.');
    await pool.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
})();
