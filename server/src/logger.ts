import winston from 'winston'
import debug from 'debug'

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      // timestamp: true, fixme -> ikke i type definition, kan fjernes?
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

export const jsonLogger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
})

export const debugLogger = debug('hm-delbestilling')
