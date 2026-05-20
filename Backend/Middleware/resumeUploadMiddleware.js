const multer = require('multer'); //for storing the file in the server
const path = require('path');
const { v4: uuidv4 } = require('uuid'); //for generating unique file names

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) =>{
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) =>{
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if(allowed.includes(ext)){
        cb(null, true);
    }else{
        cb(new Error('Only PDF and Word Documents are allowed to be upload'), false)
    }
};

const upload = multer ({
    storage,fileFilter, limits: {fileSize: 5*1024*1024} //5MB Max
});

module.exports = upload;