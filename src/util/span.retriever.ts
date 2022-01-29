import { trace } from '@opentelemetry/api';

export const retreiveAppTracer = () => trace.getTracer('pet-authorization-app-tracer');
