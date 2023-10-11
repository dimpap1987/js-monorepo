import express, { Request, Express } from 'express'
import bodyParser from 'body-parser'
import { executeDockerCompose, validateWebhookRequest } from './webhook.utils'

const port = process.env.PORT || 3333

const app: Express = express()
app.use(bodyParser.json())

app.post('/api/:project', (req: Request, res) => {
  try {
    validateWebhookRequest(req)
  } catch (err) {
    return res.status(401).send('Unauthorized')
  }
  const project = req.params.project

  executeDockerCompose(
    project,
    () => {
      return res.send('Docker Compose started successfully.')
    },
    () => {
      return res.status(500).send('Failed to start Docker Compose.')
    }
  )
})

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`)
})
server.on('error', console.error)
