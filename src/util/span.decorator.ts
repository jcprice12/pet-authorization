import { Span, Tracer } from '@opentelemetry/api';

export type TracerRetriever = () => Tracer;

export function Span(getTracer: TracerRetriever) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        const tracer = getTracer();
        let span: Span;
        try {
          span = tracer.startSpan(propertyKey);
          return original.apply(thisArg, args);
        } finally {
          span.end();
        }
      }
    });
  };
}
