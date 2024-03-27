import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
})

export { logger }
