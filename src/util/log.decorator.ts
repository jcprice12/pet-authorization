import { Logger } from 'winston';
import { LogAttribute } from './log-attribute.model';

export type LogRetriever = (that?: any) => Logger;

export type LogDecoratorOptions = {
  logPromise?: boolean;
  argMappings?: Array<string | ((arg: any) => LogAttribute)>;
  resultMapping?: string | ((result: any) => LogAttribute);
  successMessage?: string;
};

export function Log(getLogger: LogRetriever, options: LogDecoratorOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        const logger = getLogger(thisArg);
        const logAttributes = {
          class: target.name ? target.name : target.constructor.name,
          method: propertyKey,
          ...mapArgsToMetadataObject(args, options.argMappings)
        };
        function onSuccess(result: any) {
          const resultLogAttribute = mapToLogAttribute(result, options.resultMapping ?? 'result');
          logger.info({
            message: options.successMessage || 'successful method invocation',
            [resultLogAttribute.name]: resultLogAttribute.value,
            ...logAttributes
          });
          return result;
        }
        function onFailure(e: Error) {
          logger.error({ message: e.stack || e.message, ...logAttributes });
          throw e;
        }
        async function awaitAction() {
          try {
            return onSuccess(await original.apply(thisArg, args));
          } catch (e) {
            onFailure(e);
          }
        }
        function doAction() {
          try {
            return onSuccess(original.apply(thisArg, args));
          } catch (e) {
            onFailure(e);
          }
        }
        return options.logPromise ? awaitAction() : doAction();
      }
    });
  };
}

export function LogPromise(
  getLogger: LogRetriever,
  options: Omit<LogDecoratorOptions, 'logPromise'> = {}
) {
  return Log(getLogger, { ...options, logPromise: true });
}

function mapToLogAttribute(value: any, mapping: string | ((val: any) => LogAttribute)) {
  return typeof mapping === 'string' ? { name: mapping, value } : mapping(value);
}

function mapArgsToLogAttributes(
  args: Array<any>,
  argMappings: Array<string | ((arg: any) => LogAttribute)> = []
): Array<LogAttribute> {
  return args.map((arg, index) => mapToLogAttribute(arg, argMappings[index] ?? `arg${index + 1}`));
}

function mapArgsToMetadataObject(
  args: Array<any>,
  argMappings?: Array<string | ((arg: any) => LogAttribute)>
) {
  return mapArgsToLogAttributes(args, argMappings).reduce(
    (accumulator: any, currentLogAttribute: LogAttribute) => {
      accumulator[currentLogAttribute.name] = currentLogAttribute.value;
      return accumulator;
    },
    {}
  );
}
