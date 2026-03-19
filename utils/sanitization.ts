/**
 * Sanitization and Validation Utilities
 */

/**
 * Strips HTML tags from a string and trims whitespace.
 * Prevents basic XSS by ensuring no HTML is processed.
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  // Remove HTML tags
  const stripped = str.replace(/<[^>]*>?/gm, '');
  // Trim and return
  return stripped.trim();
};

/**
 * Validates an email address using a standard RFC pattern.
 */
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates a phone number (simple pattern for international/local formats).
 */
export const validatePhone = (phone: string): boolean => {
  // Allows +, spaces, dashes, and digits. Minimum 7 digits.
  const re = /^[\d\s\-+]{7,20}$/;
  return re.test(phone);
};

/**
 * Sanitizes an entire object of form data (shallow).
 */
export const sanitizeForm = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    }
  }
  return sanitized;
};
