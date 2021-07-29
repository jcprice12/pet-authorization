import { Logger } from 'winston';

export const retrieveLoggerOnClass = (thiz: { logger: Logger }) => thiz.logger;
