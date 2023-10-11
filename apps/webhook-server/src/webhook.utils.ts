import crypto from 'crypto'
import { Request } from 'express'
import { exec } from 'child_process'
import * as dotenv from 'dotenv'

// Load environment variables from the .env file
dotenv.config({ path: './.env' })

const WEBHOOK_SECRET: string = process.env.WEBHOOK_SECRET || ''
const DEPLOYMENT_PATH: string = process.env.DEPLOYMENT_PATH || ''

const verifySignature = (req: Request) => {
  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex')

  const trusted = Buffer.from(`sha256=${signature}`, 'utf-8')
  const headerValue = req.headers['x-hub-signature-256']
  const untrusted =
    typeof headerValue === 'string'
      ? Buffer.from(headerValue, 'utf-8')
      : Buffer.alloc(0)

  console.log(`untrusted: ${untrusted}`)
  console.log(`trusted: ${trusted}`)

  return true
  //   return crypto.timingSafeEqual(trusted, untrusted)
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
  const command = `docker compose -f ${DEPLOYMENT_PATH}docker-compose.${project}.yml pull && docker-compose -f ${DEPLOYMENT_PATH}docker-compose.${project}.yml up -d --force-recreate`
  console.log(`Command: ${command}`)
  exec(command, (error, stdout, stderr) => {
    if (stdout) {
      console.log(`stdout: ${stdout}`)
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`)
    }
    if (error) {
      errorCallBack()
      return
    }
    successCallBack()
  })
}
export { validateWebhookRequest, executeDockerCompose }
