import { Logger } from 'winston';
import { LogOnArrival } from './log.decorator';

describe('Given logger', () => {
  let infoSpy: jest.Mock;
  let logger: Logger;
  const logRetriever = () => logger;
  beforeEach(() => {
    infoSpy = jest.fn();
    logger = {
      info: infoSpy
    } as unknown as Logger;
  });

  describe('Given things to log', () => {
    interface ArbitraryInterface {
      arb: string;
    }
    class ArbitraryClass {
      constructor(private readonly arb: string) {}
      public arbitrate(): string {
        return this.arb;
      }
    }

    let arbitraryString: string;
    let arbitraryNumber: number;
    let arbitraryBoolean: boolean;
    let arbitraryFunction: (arb: string) => string;
    let arbitraryObj: ArbitraryInterface;
    let arbitraryInstance: ArbitraryClass;

    beforeEach(() => {
      arbitraryString = 'hola';
      arbitraryBoolean = true;
      arbitraryNumber = 42;
      arbitraryFunction = (arb: string) => arb;
      arbitraryObj = {
        arb: 'hello'
      };
      arbitraryInstance = new ArbitraryClass('hi');
    });

    describe('Given default LogOnArrival options', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnArrival(logRetriever)
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): string {
          return this.classField;
        }
      }

      let constructorArg: string;
      let classToTest: ClassToTest;
      beforeEach(() => {
        classToTest = new ClassToTest(constructorArg);
      });

      describe('When invoking method', () => {
        let result: string;
        beforeEach(() => {
          result = classToTest.testLogging(
            arbitraryString,
            arbitraryNumber,
            arbitraryBoolean,
            arbitraryFunction,
            arbitraryInstance,
            arbitraryObj
          );
        });

        it('Then correct log is generated', () => {
          expect(infoSpy).toHaveBeenCalledWith({
            message: 'method invoked',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj
          });
        });

        it('Then original return value is returned', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });
  });
});
