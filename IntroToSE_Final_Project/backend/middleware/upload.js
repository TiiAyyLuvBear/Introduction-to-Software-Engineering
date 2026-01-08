/**
 * Multer Configuration - File Upload Middleware
 * 
 * Xử lý upload file (avatar, documents, etc.)
 * Lưu file vào thư mục uploads/
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Storage configuration for avatars
 */
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: userId-timestamp.ext
        const userId = req.user?._id || 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${userId}-${timestamp}${ext}`);
    }
});

/**
 * File filter - Only allow images
 */
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

/**
 * Multer upload middleware for avatars
 * - Max file size: 2MB
 * - Only images allowed
 */
export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: imageFilter
});

/**
 * Memory storage for temporary uploads (if needed)
 */
export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: imageFilter
});

export default {
    uploadAvatar,
    uploadMemory
};
