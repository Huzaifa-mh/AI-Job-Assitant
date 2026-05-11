```
Dependencies:
npm init -y
npm install express mssql bcryptjs jsonwebtoken dotenv cors multer axios
npm install --save-dev nodemon
```
## 📁 Project Structure
```text
├── config/
│   └── db.js              # SQL Server connection logic
├── controllers/
│   ├── authController.js  # Logic for register, login, and logout
│   └── userController.js  # Logic for profile management
├── middleware/
│   ├── authMiddleware.js  # JWT validation & route protection
│   └── errorMiddleware.js # Global centralized error handling
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   └── userRoutes.js      # User-related endpoints
├── .env                   # Environment variables (DB credentials, JWT secrets)
├── .gitignore             # Files to exclude from Git
├── server.js              # Main entry point
└── package.json           # Dependencies and scripts
```
