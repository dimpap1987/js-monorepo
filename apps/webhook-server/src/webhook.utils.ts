import crypto from 'crypto'
import { Request } from 'express'
import { exec } from 'child_process'

const WEBHOOK_SECRET: string = process.env.WEBHOOK_SECRET || ''

const verifySignature = (req: Request) => {
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex')

  const trusted = Buffer.from(`sha256=${signature}`, 'ascii')

  const headerValue = req.headers['x-hub-signature-256']
  const untrusted =
    typeof headerValue === 'string'
      ? Buffer.from(headerValue, 'ascii')
      : Buffer.alloc(0)

  return crypto.timingSafeEqual(trusted, untrusted)
}

const validateWebhookRequest = (req: Request) => {
  if (!verifySignature(req)) {
    throw new Error('Unauthorized')
  }
}

const executeDockerCompose = (
  project: string,
  successCallBack: () => void,
  errorCallBack: () => void
) => {
  exec(
    `docker-compose -f docker-compose.${project}.yml up -d`,
    (error, stdout, stderr) => {
      if (error) {
        errorCallBack()
      }
      successCallBack()
    }
  )
}
export { validateWebhookRequest, executeDockerCompose }
