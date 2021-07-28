import { Logger } from 'winston';
import { LogAttribute } from './log-attribute.model';

export function Log(
  getLogger: (that?: any) => Logger,
  options: {
    logPromise?: boolean;
    argMappings?: Array<string | ((arg: any) => LogAttribute)>;
  } = {
    logPromise: false
  }
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = new Proxy(descriptor.value, {
      apply: function (original, thisArg: any, args: any[]) {
        const logger = getLogger(thisArg);
        const logAttributes = {
          class: target.name ? target.name : target.constructor.name,
          method: propertyKey,
          ...mapArgsToMetadataObject(args, options.argMappings)
        };
        function onSuccess(returnVal: any) {
          logger.info({
            message: 'successful method invocation',
            returnValue: returnVal,
            ...logAttributes
          });
          return returnVal;
        }
        function onFailure(e: Error) {
          logger.error({ message: e.stack ?? e.message, ...logAttributes });
          throw e;
        }
        async function awaitAction() {
          try {
            const returnVal = await original.apply(thisArg, args);
            return onSuccess(returnVal);
          } catch (e) {
            onFailure(e);
          }
        }
        function doAction() {
          try {
            const returnVal = original.apply(thisArg, args);
            return onSuccess(returnVal);
          } catch (e) {
            onFailure(e);
          }
        }
        return options.logPromise ? awaitAction() : doAction();
      }
    });
  };
}

function mapArgsToLogAttributes(
  args: Array<any>,
  argMappings: Array<string | ((arg: any) => LogAttribute)> = []
): Array<LogAttribute> {
  return args.map((arg, index) => {
    const mapping = argMappings[index];
    let logAttribute: LogAttribute;
    switch (typeof mapping) {
      case 'string':
        logAttribute = { name: mapping, value: arg?.toString() };
        break;
      case 'function':
        logAttribute = mapping(arg);
        break;
      default:
        logAttribute = { name: `arg${index + 1}`, value: arg?.toString() };
    }
    return logAttribute;
  });
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
