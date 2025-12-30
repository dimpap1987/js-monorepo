import { json } from 'body-parser'
import { Request, Response } from 'express'

interface RequestWithRawBody extends Request {
  rawBody: Buffer
}

function rawBodyMiddleware() {
  return json({
    verify: (request: RequestWithRawBody, response: Response, buffer: Buffer) => {
      if (request.url?.endsWith('/payments/webhook') && Buffer.isBuffer(buffer)) {
        request.rawBody = buffer
      }
      return true
    },
  })
}

export { rawBodyMiddleware, RequestWithRawBody }
