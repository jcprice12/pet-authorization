import { Span, Tracer, trace, context } from '@opentelemetry/api';

export type TracerRetriever = () => Tracer;

export function Span(getTracer: TracerRetriever) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        const activeContext = context.active();
        const parentSpan = trace.getSpan(activeContext);
        const ctx = trace.setSpan(activeContext, parentSpan);
        const tracer = getTracer();
        return tracer.startActiveSpan(propertyKey, undefined, ctx, (span: Span) => {
          try {
            return original.apply(thisArg, args);
          } finally {
            span.end();
          }
        });
      }
    });
  };
}
