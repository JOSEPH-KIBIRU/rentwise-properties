/**
 * Generate a URL-friendly slug from a string
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start
    .replace(/-+$/, '');          // Trim - from end
};

/**
 * Format price in Kenyan Shillings
 */
const formatPrice = (price, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Format date to readable format
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Validate property category
 */
const isValidCategory = (category) => {
  const validCategories = ['For Sale', 'To Let', 'Land', 'Short-term'];
  return validCategories.includes(category);
};

/**
 * Validate property type
 */
const isValidPropertyType = (type) => {
  const validTypes = ['House', 'Apartment', 'Commercial', 'Land', 'Townhouse', 'Villa'];
  return validTypes.includes(type);
};

/**
 * Compress and optimize image (simplified version)
 * Note: Full implementation will be in controller with sharp
 */
const prepareImageForUpload = async (buffer, originalName) => {
  // This is a placeholder - actual implementation in property controller
  return {
    buffer,
    filename: `${Date.now()}-${originalName}`,
    mimetype: 'image/jpeg'
  };
};

module.exports = {
  generateSlug,
  formatPrice,
  formatDate,
  isValidCategory,
  isValidPropertyType,
  prepareImageForUpload
};