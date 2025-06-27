// Logging middleware for the app
// Usage: import logger from './logger'; logger.log('info', 'message');

const logger = {
  log: (type, message, data) => {
    const timestamp = new Date().toISOString();
    // Only use console.log here as per requirements
    console.log(`[${timestamp}] [${type.toUpperCase()}]`, message, data || '');
  },
};

export default logger; 