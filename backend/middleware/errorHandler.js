const { Prisma } = require('@prisma/client');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        return res.status(409).json({
          error: `A record with this value already exists.`,
          field: err.meta?.target?.join(', ')
        });
      case 'P2025':
        // Record to update not found
        return res.status(404).json({ error: 'The requested record was not found.' });
      default:
        return res.status(500).json({ error: 'A database error occurred.' });
    }
  }

  // Handle Joi validation errors
  if (err.isJoi) {
      return res.status(400).json({
          error: 'Validation failed.',
          details: err.details.map(d => d.message).join(', ')
      });
  }

  // Generic error
  return res.status(500).json({
    error: 'An internal server error occurred.',
    message: err.message
  });
};

module.exports = errorHandler;
