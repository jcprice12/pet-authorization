import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK, tracing } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  traceExporter: new tracing.ConsoleSpanExporter(),
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'pet-authorization'
  }),
  contextManager: new AsyncHooksContextManager().enable(),
  instrumentations: [new HttpInstrumentation()]
});

export function startTracing() {
  if (process.env['DISABLE_OTEL'] !== 'y') {
    sdk.start();
  }
}

process.on('SIGINT', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
