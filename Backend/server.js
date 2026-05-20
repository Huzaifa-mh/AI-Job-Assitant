const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./Middleware/errorMiddleware');

const authRoutes = require('./Routes/authRoutes');
const userRoutes = require('./Routes/userRoutes');

dotenv.config();const app =express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

connectDB().then((() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}));

const path = require('path');

const resumeRoutes = require('./Routes/resumeUploadRoutes');
// add this line after your existing app.use lines:
app.use('/api/resume', resumeRoutes);