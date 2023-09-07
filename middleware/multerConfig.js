import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const generateUniqueFileName = (file) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(10).toString('hex');
    const ext = path.extname(file.originalname);
    
    const fileName = `${timestamp}-${randomString}${ext}`;
    return fileName;
};

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/'); 
    },
    filename: (req, file, cb) => {
        const fileName = generateUniqueFileName(file);
        cb(null, fileName); 
    }
});

const fileFilter = (req, file, cb) => {
    const fileSize = parseInt(req.headers["content-length"])
    const allowedTypes = ['.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname);

    if (!allowedTypes.includes(ext.toLowerCase())) {
        req.fileValidationError = { message: 'Invalid file type' };
        return cb(null, false);
    }

    cb(null, true);
};

const upload = multer({
    storage: fileStorage, 
    fileFilter: fileFilter, 
    limits: { fieldSize: 25 * 1024 * 1024 }
});

export default upload;
