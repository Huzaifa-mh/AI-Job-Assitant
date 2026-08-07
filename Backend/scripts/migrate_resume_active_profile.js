// One-off migration for the Resume Management & Profile Auto-Population feature.
// Run with: node scripts/migrate_resume_active_profile.js
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
  `IF COL_LENGTH('Resumes', 'is_active') IS NULL ALTER TABLE Resumes ADD is_active BIT NOT NULL CONSTRAINT DF_Resumes_is_active DEFAULT 0`,
  // Filtered unique index: enforces at most one active resume per user at the DB level
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Resumes_UserActive' AND object_id = OBJECT_ID('Resumes'))
   CREATE UNIQUE INDEX UQ_Resumes_UserActive ON Resumes(user_id) WHERE is_active = 1`,
  `IF COL_LENGTH('Users', 'phone') IS NULL ALTER TABLE Users ADD phone VARCHAR(30) NULL`,
  `IF COL_LENGTH('Users', 'linkedin_url') IS NULL ALTER TABLE Users ADD linkedin_url VARCHAR(255) NULL`,
  `IF COL_LENGTH('Users', 'github_url') IS NULL ALTER TABLE Users ADD github_url VARCHAR(255) NULL`,
  `IF COL_LENGTH('Users', 'portfolio_url') IS NULL ALTER TABLE Users ADD portfolio_url VARCHAR(255) NULL`,
  `IF COL_LENGTH('Users', 'location') IS NULL ALTER TABLE Users ADD location VARCHAR(255) NULL`,
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
