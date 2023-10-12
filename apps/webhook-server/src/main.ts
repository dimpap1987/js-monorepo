import express, { Request, Express } from 'express'
// import bodyParser from 'body-parser'
import morgan from 'morgan'
import { executeDockerCompose, validateWebhookRequest } from './webhook.utils'

const port = process.env.PORT || 3333

const app: Express = express()

// Morgan logger setup
app.use(morgan('combined'))

// app.use(bodyParser.json())

app.post('/api/:project', (req: Request, res) => {
  try {
    // validateWebhookRequest(req) //TODO
  } catch (err) {
    return res.status(401).send({ message: 'Unauthorized' })
  }
  const project = req.params.project

  executeDockerCompose(
    project,
    () => {
      res.send({ message: 'Docker Compose started successfully.' })
    },
    () => {
      res.status(500).send({
        message: `Failed to start Docker Compose with project name: ${project}`,
      })
    }
  )
})

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`)
})
server.on('error', console.error)
