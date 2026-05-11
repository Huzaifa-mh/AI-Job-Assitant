
Dependencies:
npm init -y
npm install express mssql bcryptjs jsonwebtoken dotenv cors multer axios
npm install --save-dev nodemon

File Structure:
├── config/
│   └── db.js              ← SQL Server connection
├── controllers/
│   ├── authController.js  ← register, login, logout
│   └── userController.js  ← get/update profile
├── middleware/
│   ├── authMiddleware.js  ← protect routes with JWT
│   └── errorMiddleware.js ← global error handler
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── .env                   ← secrets (never commit this)
├── .gitignore
├── server.js              ← entry point
└── package.json
