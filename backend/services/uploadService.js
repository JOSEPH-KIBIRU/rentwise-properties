const cloudinary = require('../config/cloudinary');

/**
 * Upload multiple images to Cloudinary
 */
const uploadImages = async (files, folder = 'rentwise-properties') => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
            eager: [
              { width: 300, height: 200, crop: 'fill', format: 'jpg' },
              { width: 600, height: 400, crop: 'fill', format: 'jpg' },
              { width: 1200, height: 800, crop: 'fill', format: 'jpg' }
            ],
            eager_async: true,
            public_id: `${Date.now()}_${index}_${file.originalname.split('.')[0]}`
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
        mobile: result.eager?.[1]?.secure_url || result.secure_url,
        desktop: result.eager?.[2]?.secure_url || result.secure_url
      };
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload images');
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = { uploadImages, deleteImage };