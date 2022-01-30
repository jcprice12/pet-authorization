import { trace } from '@opentelemetry/api';

export const tracer = trace.getTracer('pet-authorization-app-tracer');
export const retreiveAppTracer = () => tracer;
