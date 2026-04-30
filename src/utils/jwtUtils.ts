import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/env.ts';
import logger from '../config/logger.ts';

const verifyWithSupportedSecrets = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (rawError) {
    // Spring services often use Decoders.BASE64.decode(secret) for HMAC keys.
    try {
      const base64Secret = Buffer.from(jwtSecret, 'base64');
      return jwt.verify(token, base64Secret);
    } catch (_base64Error) {
      throw rawError;
    }
  }
};

/**
 * JWT Utility functions - Similar to Spring Boot's JwtUtils
 */
export const jwtUtils = {
  /**
   * Validate JWT token
   * @param {string} token - JWT token to validate
   * @returns {boolean} - Token is valid
   */
  validateJwtToken: (token) => {
    try {
      verifyWithSupportedSecrets(token);
      return true;
    } catch (error) {
      logger.warn(`JWT validation failed: ${error.message}`);
      return false;
    }
  },

  /**
   * Extract username/userId from JWT token
   * @param {string} token - JWT token
   * @returns {string|null} - Username or null if invalid
   */
  getUserIdFromToken: (token) => {
    try {
      const decoded = verifyWithSupportedSecrets(token);
      return decoded.id || decoded.userId || decoded.sub;
    } catch (error) {
      logger.warn(`Failed to extract user from token: ${error.message}`);
      return null;
    }
  },

  /**
   * Decode JWT without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {object|null} - Decoded token or null
   */
  decodeJwtToken: (token) => {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.warn(`Failed to decode token: ${error.message}`);
      return null;
    }
  },

  /**
   * Extract user details from decoded token
   * @param {object} decoded - Decoded JWT payload
   * @returns {object} - User details
   */
  extractUserDetails: (decoded) => {
    return {
      id: decoded.id || decoded.userId || decoded.sub,
      userId: decoded.id,
      employeeId: decoded.empId || decoded.employeeId || decoded.employeeID || null,
      email: decoded.email,
      roles: decoded.roles || decoded.role || [],
      iat: decoded.iat,
      exp: decoded.exp,
    };
  },
};
