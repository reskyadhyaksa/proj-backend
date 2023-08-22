import multer from 'multer';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'image');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ){
        cb(null, true);
    } else {
        cb(null, false);
    }
} 

const Upload = multer({storage: fileStorage, fileFilter: fileFilter});

export default Upload;