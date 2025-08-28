import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = './uploads/profile-pictures';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: userId_timestamp.ext (works for both passengers and captains)
        const userId = req.passenger?._id || req.captain?._id;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${userId}_${timestamp}${ext}`);
    }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, JPEG, PNG) are allowed'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
        files: 1 // Only allow one file
    },
    fileFilter: fileFilter
});

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 2MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only one file is allowed'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field'
            });
        }
    }
    
    if (error.message === 'Only image files (JPG, JPEG, PNG) are allowed') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'File upload error'
    });
};

// Helper function to delete old profile picture
export const deleteOldProfilePic = (filename) => {
    if (!filename) return;
    
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted old profile picture: ${filename}`);
        } catch (error) {
            console.error(`Failed to delete old profile picture: ${filename}`, error);
        }
    }
};

export default upload;