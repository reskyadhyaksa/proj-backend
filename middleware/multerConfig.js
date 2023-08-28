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

    // if (fileSize > 25000000) {
    //     req.fileValidationError = { message: 'Images must be less than 25 MB' };
    //     return cb(null, false);
    // }

    cb(null, true);
};

const upload = multer({
    storage: fileStorage, 
    fileFilter: fileFilter, 
});

export default upload;
