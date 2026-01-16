import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import {
  envDetector,
  processDetector,
  hostDetector,
  resourceFromAttributes,
  detectResources,
} from '@opentelemetry/resources'
import { apiLogger } from './main'

if (process.env['OTEL_ENABLED'] === 'true') {
  const sdk = new NodeSDK({
    contextManager: new AsyncLocalStorageContextManager(),
    resource: resourceFromAttributes({
      'service.name': 'bibikos-api',
      'deployment.environment': process.env.NODE_ENV || 'development',
    }).merge(
      detectResources({
        detectors: [envDetector, processDetector, hostDetector],
      })
    ),
    traceExporter: new OTLPTraceExporter({
      url: `http://${process.env.OTEL_HOSTNAME}:4318/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `http://${process.env.OTEL_HOSTNAME}:4318/v1/metrics`,
      }),
      exportIntervalMillis: 1000,
    }),
    instrumentations: [
      new NestInstrumentation(),
      getNodeAutoInstrumentations({
        // fs and net usually create too many spans
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  })

  sdk.start()

  apiLogger.log('📈 OpenTelemetry: Active')

  // Graceful shutdown only if SDK exists
  const gracefulShutdown = () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0))
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
}
