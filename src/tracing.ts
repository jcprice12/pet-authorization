import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK, tracing } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  traceExporter: new tracing.ConsoleSpanExporter(),
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'pet-authorization'
  }),
  instrumentations: [new HttpInstrumentation()]
});

export function startTracing() {
  sdk
    .start()
    .then(() => console.log('Tracing initialized'))
    .catch((error) => console.log('Error initializing tracing', error));
}

process.on('SIGINT', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
