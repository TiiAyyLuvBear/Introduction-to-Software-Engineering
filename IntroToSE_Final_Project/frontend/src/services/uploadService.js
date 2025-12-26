// services/uploadService.js
// Using ImgBB - Free image hosting service

/**
 * ImgBB API Configuration
 * Get your API key at: https://api.imgbb.com/
 */
const IMGBB_API_KEY = 'fe119c155c1c50527a22f7a9ccbd1ed6'; // ← Paste your API key here
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

/**
 * Upload image to ImgBB
 */
export const uploadImage = async (file, folder = 'images', userId = 'anonymous') => {
    try {
        // Validate file
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and BMP are allowed.');
        }

        // Validate file size (ImgBB max: 32MB, we limit to 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 5MB.');
        }

        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Prepare form data
        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64.split(',')[1]); // Remove data:image/...;base64, prefix
        formData.append('name', `${folder}_${userId}_${Date.now()}`);

        // Upload to ImgBB
        const response = await fetch(IMGBB_API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error('Upload failed');
        }

        // Return the direct image URL
        return data.data.url;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

/**
 * Convert File to Base64
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Delete image (not supported in free tier)
 */
export const deleteImage = async (imageUrl) => {
    console.log('Note: ImgBB free tier does not support image deletion via API');
};

/**
 * Upload avatar
 */
export const uploadAvatar = async (file, userId) => {
    return uploadImage(file, 'avatars', userId);
};

/**
 * Compress image before upload
 */
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    },
                    file.type,
                    quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

export default {
    uploadImage,
    deleteImage,
    uploadAvatar,
    compressImage
};
