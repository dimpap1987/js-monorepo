import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'

const sdk = new NodeSDK({
  contextManager: new AsyncLocalStorageContextManager(),
  resource: resourceFromAttributes({
    'service.name': 'my-api',
  }),
  traceExporter: new OTLPTraceExporter({
    url: `http://${process.env.OTEL_HOSTNAME}:4318/v1/traces`,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `http://${process.env.OTEL_HOSTNAME}:4318/v1/metrics`,
    }),
    exportIntervalMillis: 1000,
  }),
  instrumentations: [getNodeAutoInstrumentations(), new NestInstrumentation()],
})

sdk.start()

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error: unknown) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0))
})
