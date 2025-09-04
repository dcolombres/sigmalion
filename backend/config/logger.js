const winston = require('winston');
const path = require('path');
const SQLite3 = require('winston-sqlite3');

const logDbPath = path.join(__dirname, '../prisma/monolog.db');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `monolog.db`
    // - Write all logs with importance level of `info` or less to the console
    //
    new SQLite3({
      db: logDbPath,
      level: 'error', // Log errors and below to the DB
      table: 'logs',
      fields: ['level', 'message', 'timestamp', 'meta']
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Stream for morgan to pipe HTTP logs to winston
logger.stream = {
  write: function(message, encoding) {
    logger.info(message.trim());
  },
};

module.exports = logger;
