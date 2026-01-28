/**
 * Input Sanitization Utilities
 * Helps prevent XSS and other injection attacks
 */

// HTML entities to escape
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'`=\/]/g, (char) => HTML_ENTITIES[char]);
}

/**
 * Remove potentially dangerous HTML tags
 * @param {string} str - Input string to sanitize
 * @returns {string} - String with HTML tags removed
 */
export function stripHtmlTags(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize an object's string values recursively
 * @param {Object} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(obj, options = { escape: true, stripTags: true }) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    let result = obj;
    if (options.stripTags) {
      result = stripHtmlTags(result);
    }
    if (options.escape) {
      result = escapeHtml(result);
    }
    return result;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value, options);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize common input fields
 * @param {Object} input - Input object to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: [], sanitized: {} }
 */
export function validateAndSanitize(input, rules = {}) {
  const errors = [];
  const sanitized = {};

  for (const [field, value] of Object.entries(input)) {
    const rule = rules[field] || {};
    let sanitizedValue = value;

    // Type check
    if (rule.type && typeof value !== rule.type) {
      if (rule.required) {
        errors.push(`${field} must be a ${rule.type}`);
      }
      continue;
    }

    // String sanitization
    if (typeof value === 'string') {
      // Trim whitespace
      sanitizedValue = value.trim();

      // Length check
      if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
        sanitizedValue = sanitizedValue.substring(0, rule.maxLength);
      }

      if (rule.minLength && sanitizedValue.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }

      // Strip HTML if not allowed
      if (!rule.allowHtml) {
        sanitizedValue = stripHtmlTags(sanitizedValue);
      }

      // Escape HTML entities
      if (rule.escape !== false) {
        sanitizedValue = escapeHtml(sanitizedValue);
      }

      // Email validation
      if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedValue)) {
        errors.push(`${field} must be a valid email`);
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        errors.push(`${field} has invalid format`);
      }
    }

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
    }

    sanitized[field] = sanitizedValue;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Middleware-style sanitizer for GraphQL inputs
 * Use in resolvers to sanitize mutation inputs
 * @param {Object} input - The input object from GraphQL
 * @returns {Object} - Sanitized input
 */
export function sanitizeInput(input) {
  if (!input) return input;
  
  // Deep clone and sanitize
  return sanitizeObject(input, { 
    escape: false,  // Don't escape for DB storage (Sequelize handles this)
    stripTags: true // Do remove HTML tags
  });
}

export default {
  escapeHtml,
  stripHtmlTags,
  sanitizeObject,
  validateAndSanitize,
  sanitizeInput,
};
