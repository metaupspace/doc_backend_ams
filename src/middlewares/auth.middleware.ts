import logger from '../config/logger.ts';
import { jwtUtils } from '../utils/jwtUtils.ts';
import * as documentRepository from '../modules/document/repositories/document.repository.ts';

/**
 * List of public endpoints that don't require authentication
 * Similar to Spring Boot's AUTH_WHITELIST
 */
const PUBLIC_ROUTES = ['/health', '/api/health', '/api/v1/health', '/api-docs', '/openapi.json'];

/**
 * Check if request path is in public routes
 * @param {string} path - Request path
 * @returns {boolean} - Is public route
 */
const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
};

/**
 * JWT Authentication Filter Middleware
 * Validates Bearer token similar to Spring Boot JwtAuthenticationFilter
 * Attached user info to request if valid
 */
export const validateToken = async (req, res, next) => {
  try {
    // Skip if public route
    if (isPublicRoute(req.path)) {
      return next();
    }

    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Validate Authorization header format
    if (!authHeader) {
      logger.warn('Missing Authorization header', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(401).json({
        status: 'error',
        message: 'Missing Authorization header',
        code: 'MISSING_TOKEN',
      });
    }

    // Validate Bearer prefix
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Invalid Authorization header format', {
        path: req.path,
        method: req.method,
        received: authHeader.substring(0, 20),
      });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid Authorization format. Use Bearer <token>',
        code: 'INVALID_BEARER_FORMAT',
      });
    }

    // Extract token
    const token = authHeader.substring(7).trim();

    if (!token) {
      logger.warn('Empty Bearer token', {
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({
        status: 'error',
        message: 'Token cannot be empty',
        code: 'EMPTY_TOKEN',
      });
    }

    // Validate JWT token
    if (!jwtUtils.validateJwtToken(token)) {
      logger.warn('JWT validation failed', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      });
    }

    // Extract user from token
    const userId = jwtUtils.getUserIdFromToken(token);
    if (!userId) {
      logger.warn('Unable to extract user from token', {
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token payload',
        code: 'INVALID_PAYLOAD',
      });
    }

    // Decode and attach user details to request
    const decoded = jwtUtils.decodeJwtToken(token);
    const userDetails = jwtUtils.extractUserDetails(decoded);

    if (!userDetails.employeeId && userDetails.email) {
      const employeeRecord = await documentRepository.findActiveEmployeeByEmail(userDetails.email);

      if (employeeRecord?.employeeId) {
        userDetails.employeeId = employeeRecord.employeeId;
      }

      logger.info('Resolved employee from email lookup', {
        userId: userDetails.id,
        email: userDetails.email,
        resolvedEmployeeId: userDetails.employeeId || null,
        employeeRecordFound: Boolean(employeeRecord),
        path: req.path,
        method: req.method,
      });
    }

    req.user = userDetails;

    logger.info('JWT user extracted', {
      userId: userDetails.id,
      employeeId: userDetails.employeeId,
      empIdClaim: decoded?.empId || null,
      employeeIdClaim: decoded?.employeeId || null,
      employeeIDClaim: decoded?.employeeID || null,
      roles: userDetails.roles,
      path: req.path,
      method: req.method,
    });

    logger.debug('JWT token validated', {
      userId: userDetails.id,
      path: req.path,
      method: req.method,
    });

    return next();
  } catch (error) {
    logger.error('Unexpected error in JWT authentication', {
      error: error.message,
      path: req.path,
      method: req.method,
    });

    return res.status(500).json({
      status: 'error',
      message: 'Authentication error',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional: Check user roles (for future use)
 * Example: @requireRoles(['HR', 'ADMIN'])
 */
export const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole && allowedRoles.length > 0) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        requiredRoles: allowedRoles,
        userRoles,
      });

      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
      });
    }

    return next();
  };
};
