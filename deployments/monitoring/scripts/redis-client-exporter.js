#!/usr/bin/env node
/**
 * Redis Client Name Exporter
 * Exposes Redis CLIENT LIST with client names as Prometheus metrics
 * Run: node redis-client-exporter.js
 */

const http = require('http')
const { exec } = require('child_process')
const util = require('util')

const execPromise = util.promisify(exec)
const PORT = process.env.EXPORTER_PORT || 9122

// Find Redis container
async function findRedisContainer() {
  try {
    const { stdout } = await execPromise('docker ps --format "{{.Names}}"')
    const containers = stdout.trim().split('\n')

    // Try common names first
    for (const name of ['redis_container', 'redis', 'redis_dev', 'redis-prod']) {
      if (containers.includes(name)) {
        return name
      }
    }

    // Fallback to any redis container (excluding exporters)
    const redisContainer = containers.find(
      (name) => name.toLowerCase().includes('redis') && !name.toLowerCase().includes('exporter')
    )

    return redisContainer || null
  } catch (error) {
    console.error('Error finding Redis container:', error.message)
    return null
  }
}

// Query Redis CLIENT LIST
async function queryRedisClientList(container) {
  try {
    const { stdout } = await execPromise(`docker exec ${container} redis-cli CLIENT LIST 2>/dev/null`)
    return stdout
  } catch (error) {
    console.error('Error querying Redis:', error.message)
    return null
  }
}

// Parse CLIENT LIST output and group by name
function parseClientList(output) {
  if (!output) return {}

  const clients = {}

  output.split('\n').forEach((line) => {
    if (!line.trim()) return

    const nameMatch = line.match(/name=([^\s]*)/)
    const name = nameMatch ? nameMatch[1] || '(not set)' : '(not set)'

    clients[name] = (clients[name] || 0) + 1
  })

  return clients
}

// Generate Prometheus metrics
function generateMetrics(clients) {
  const timestamp = Date.now()
  let metrics = '# HELP redis_client_connections_total Total number of Redis client connections by name\n'
  metrics += '# TYPE redis_client_connections_total gauge\n'

  Object.entries(clients).forEach(([name, count]) => {
    // Escape special characters in metric names/labels
    const escapedName = name.replace(/"/g, '\\"').replace(/\n/g, '')
    metrics += `redis_client_connections_total{name="${escapedName}"} ${count}\n`
  })

  metrics += `\n# Redis client exporter metrics\n`
  metrics += `redis_client_exporter_last_scrape_timestamp ${timestamp}\n`
  metrics += `redis_client_exporter_total_connections ${Object.values(clients).reduce((a, b) => a + b, 0)}\n`

  return metrics
}

// Main function to scrape and export metrics
let lastMetrics =
  '# HELP redis_client_connections_total Total number of Redis client connections by name\n# TYPE redis_client_connections_total gauge\nredis_client_connections_total{name="unknown"} 0\n'

async function scrapeMetrics() {
  try {
    const container = await findRedisContainer()
    if (!container) {
      console.error('Redis container not found')
      return lastMetrics
    }

    const output = await queryRedisClientList(container)
    if (!output) {
      return lastMetrics
    }

    const clients = parseClientList(output)
    const metrics = generateMetrics(clients)
    lastMetrics = metrics

    return metrics
  } catch (error) {
    console.error('Error scraping metrics:', error.message)
    return lastMetrics
  }
}

// HTTP server
const server = http.createServer(async (req, res) => {
  if (req.url === '/metrics') {
    const metrics = await scrapeMetrics()
    res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' })
    res.end(metrics)
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <h1>Redis Client Name Exporter</h1>
      <p>Metrics endpoint: <a href="/metrics">/metrics</a></p>
      <p>Health check: <a href="/health">/health</a></p>
    `)
  }
})

server.listen(PORT, () => {
  console.log(`Redis Client Name Exporter listening on port ${PORT}`)
  console.log(`Metrics: http://localhost:${PORT}/metrics`)
})

// Scrape metrics every 15 seconds
setInterval(scrapeMetrics, 15000)
