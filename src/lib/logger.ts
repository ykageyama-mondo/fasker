import pino from 'pino';

const level = process.env.LOG_LEVEL || 'debug';

export const logger = pino({
  level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      minimumLevel: 'debug',
    },
  },
});
