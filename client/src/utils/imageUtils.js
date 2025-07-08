/**
 * Utility functions for handling image paths in React Router environment
 * Ensures images load correctly regardless of the current route
 */

/**
 * Get the correct image path for static assets
 * @param {string} imagePath - The image path relative to public/image/
 * @returns {string} - The correct absolute path
 */
export const getImagePath = (imagePath) => {
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // For development and production, use absolute path from public directory
  return `/${cleanPath}`;
};

/**
 * Get hero image path
 * @param {string} filename - The hero image filename
 * @returns {string} - The correct path to hero image
 */
export const getHeroImagePath = (filename) => {
  return getImagePath(`image/hero/${filename}`);
};

/**
 * Get article image path
 * @param {string} filename - The article image filename
 * @returns {string} - The correct path to article image
 */
export const getArticleImagePath = (filename) => {
  return getImagePath(`image/articles/${filename}`);
};

/**
 * Preload an image to ensure it's cached
 * @param {string} imagePath - The image path to preload
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export const preloadImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
};

/**
 * Preload multiple images
 * @param {string[]} imagePaths - Array of image paths to preload
 * @returns {Promise} - Promise that resolves when all images are loaded
 */
export const preloadImages = (imagePaths) => {
  return Promise.all(imagePaths.map(preloadImage));
};
