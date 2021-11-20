import { Logger } from 'winston';
import { LogAttributeFactory } from './log-attribute.factory';
import { LogAttribute } from './log-attribute.model';

export type LogRetriever = (that?: any) => Logger;
export type LogMapping = string | LogAttributeFactory;

export type LogOnArrivalDecoratorOptions = {
  arrivalMessage?: string;
  argMappings?: Array<LogMapping>;
};
export function LogOnArrival(getLogger: LogRetriever, options: LogOnArrivalDecoratorOptions = {}) {
  const finalOptions: Required<LogOnArrivalDecoratorOptions> = {
    argMappings: finalizeOption(options.argMappings, []),
    arrivalMessage: finalizeOption(options.arrivalMessage, 'method invoked')
  };
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        getLogger(thisArg).info({
          message: finalOptions.arrivalMessage,
          ...{
            class: getClassNameFromTarget(target),
            method: propertyKey,
            ...mapArgsToMetadataObject(args, finalOptions.argMappings)
          }
        });
        return original.apply(thisArg, args);
      }
    });
  };
}

export type LogOnErrorOptions = {
  argMappings?: Array<LogMapping>;
  errorMapping?: LogMapping;
  errorMessage?: string;
  wouldLikeToAwait?: boolean;
};
export function LogOnError(getLogger: LogRetriever, options: LogOnErrorOptions = {}) {
  const finalOptions: Required<LogOnErrorOptions> = {
    argMappings: finalizeOption(options.argMappings, []),
    errorMapping: finalizeOption(options.errorMapping, (error: Error) => ({ name: 'error', value: error.message })),
    errorMessage: finalizeOption(options.errorMessage, 'unsuccessful method execution'),
    wouldLikeToAwait: finalizeOption(options.wouldLikeToAwait, false)
  };
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        const logger = getLogger(thisArg);
        const logAttributes = initializeLogAttributes(target, propertyKey, args, finalOptions.argMappings);
        function onFailure(e: Error) {
          const errorLogAttribute = mapToLogAttribute(e, finalOptions.errorMapping);
          logger.error({
            message: finalOptions.errorMessage,
            [errorLogAttribute.name]: errorLogAttribute.value,
            ...logAttributes
          });
          throw e;
        }
        try {
          const result = original.apply(thisArg, args);
          return shouldAwaitAction(finalOptions.wouldLikeToAwait, result)
            ? result.then(
                (valToResolve: any) => valToResolve,
                (e) => onFailure(e)
              )
            : result;
        } catch (e) {
          onFailure(e);
        }
      }
    });
  };
}

export type LogOnResultOptions = {
  argMappings?: Array<LogMapping>;
  resultMapping?: LogMapping;
  successMessage?: string;
  wouldLikeToAwait?: boolean;
};
export function LogOnResult(getLogger: LogRetriever, options: LogOnResultOptions = {}) {
  const finalOptions: Required<LogOnResultOptions> = {
    argMappings: finalizeOption(options.argMappings, []),
    resultMapping: finalizeOption(options.resultMapping, 'result'),
    successMessage: finalizeOption(options.successMessage, 'successful method execution'),
    wouldLikeToAwait: finalizeOption(options.wouldLikeToAwait, false)
  };
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        const logger = getLogger(thisArg);
        const logAttributes = initializeLogAttributes(target, propertyKey, args, finalOptions.argMappings);
        function onSuccess(result: any): any {
          const resultLogAttribute = mapToLogAttribute(result, finalOptions.resultMapping);
          logger.info({
            message: finalOptions.successMessage,
            [resultLogAttribute.name]: resultLogAttribute.value,
            ...logAttributes
          });
          return result;
        }
        const result = original.apply(thisArg, args);
        return shouldAwaitAction(finalOptions.wouldLikeToAwait, result)
          ? result.then((valToResolve: any) => onSuccess(valToResolve))
          : onSuccess(result);
      }
    });
  };
}

export type LogDecoratorOptions = {
  wouldLikeToAwait?: boolean;
  arrivalMessage?: string;
  argMappings?: Array<LogMapping>;
  resultMapping?: LogMapping;
  successMessage?: string;
  errorMapping?: LogMapping;
  errorMessage?: string;
};
export function Log(getLogger: LogRetriever, options?: LogDecoratorOptions) {
  const logOnArrivalFn = LogOnArrival(getLogger, options);
  const logOnResultFn = LogOnResult(getLogger, options);
  const logOnErrorFn = LogOnError(getLogger, options);
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    logOnArrivalFn(target, propertyKey, descriptor);
    logOnResultFn(target, propertyKey, descriptor);
    logOnErrorFn(target, propertyKey, descriptor);
  };
}

export function LogPromise(getLogger: LogRetriever, options: Omit<LogDecoratorOptions, 'wouldLikeToAwait'> = {}) {
  return Log(getLogger, { ...options, wouldLikeToAwait: true });
}

function finalizeOption<T>(option: T | undefined, defaultVal: T): T {
  return option ?? defaultVal;
}

function getClassNameFromTarget(target: any): string {
  return target.name ?? target.constructor.name;
}

function initializeLogAttributes(target: any, propertyKey: string, args: any[], argMappings: Array<LogMapping>) {
  return {
    class: getClassNameFromTarget(target),
    method: propertyKey,
    ...mapArgsToMetadataObject(args, argMappings)
  };
}

function mapToLogAttribute(value: any, mapping: LogMapping) {
  return typeof mapping === 'string' ? { name: mapping, value } : mapping(value);
}

function mapArgsToLogAttributes(args: Array<any>, argMappings: Array<LogMapping>): Array<LogAttribute> {
  return args.map((arg, index) => mapToLogAttribute(arg, argMappings[index] ?? `arg${index + 1}`));
}

function mapArgsToMetadataObject(args: Array<any>, argMappings: Array<LogMapping>) {
  return mapArgsToLogAttributes(args, argMappings).reduce((accumulator: any, currentLogAttribute: LogAttribute) => {
    accumulator[currentLogAttribute.name] = currentLogAttribute.value;
    return accumulator;
  }, {});
}

function shouldAwaitAction(wouldLikeToAwait: boolean, value: any): boolean {
  return wouldLikeToAwait && typeof value?.then === 'function';
}
