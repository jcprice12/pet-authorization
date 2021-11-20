import { Logger } from 'winston';
import { LogOnArrival, LogOnError, LogOnResult } from './log.decorator';

describe('Given logger', () => {
  let errorSpy: jest.Mock;
  let infoSpy: jest.Mock;
  let logger: Logger;
  const logRetriever = () => logger;
  beforeEach(() => {
    infoSpy = jest.fn();
    errorSpy = jest.fn();
    logger = {
      info: infoSpy,
      error: errorSpy
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
        constructorArg = 'yooo';
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

    describe('Given arg mappings for LogOnArrival', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnArrival(logRetriever, {
          argMappings: [null, 'arbNumber', (arg: boolean) => ({ name: 'arbBool', value: !arg })]
        })
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
        constructorArg = 'yooo';
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
            arbNumber: arbitraryNumber,
            arbBool: !arbitraryBoolean,
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

    describe('Given arrival message for LogOnArrival', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnArrival(logRetriever, {
          arrivalMessage: 'hello world'
        })
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
        constructorArg = 'yooo';
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
            message: 'hello world',
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

    describe('Given default LogOnResult options', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever)
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
        constructorArg = 'yooo';
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
            message: 'successful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            result
          });
        });

        it('Then original return value is returned', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });

    describe('Given arg mappings for LogOnResult', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever, {
          argMappings: [null, 'arbNumber', (arg: boolean) => ({ name: 'arbBool', value: !arg })]
        })
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
        constructorArg = 'yooo';
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
            message: 'successful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arbNumber: arbitraryNumber,
            arbBool: !arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            result
          });
        });

        it('Then original return value is returned', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });

    describe('Given result mapping for LogOnResult', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever, {
          resultMapping: (result: string) => ({ name: 'returnValue', value: `I (${result}) am the result` })
        })
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
        constructorArg = 'yooo';
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
            message: 'successful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            returnValue: 'I (yooo) am the result'
          });
        });

        it('Then original return value is returned', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });

    describe('Given success message for LogOnResult', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever, {
          successMessage: 'I am successful'
        })
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
        constructorArg = 'yooo';
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
            message: 'I am successful',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            result
          });
        });

        it('Then original return value is returned', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });

    describe('Given would like to await for non-promise-returning method decorated with LogOnResult', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever, {
          wouldLikeToAwait: true
        })
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
        constructorArg = 'yooo';
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
            message: 'successful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            result
          });
        });

        it('Then original return value is returned', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });

    describe('Given would like to await for promise-returning method decorated with LogOnResult', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever, {
          wouldLikeToAwait: true
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): Promise<string> {
          return Promise.resolve(this.classField);
        }
      }

      let constructorArg: string;
      let classToTest: ClassToTest;
      beforeEach(() => {
        constructorArg = 'yooo';
        classToTest = new ClassToTest(constructorArg);
      });

      describe('When invoking method', () => {
        let result: string;
        beforeEach(async () => {
          result = await classToTest.testLogging(
            arbitraryString,
            arbitraryNumber,
            arbitraryBoolean,
            arbitraryFunction,
            arbitraryInstance,
            arbitraryObj
          );
        });

        it('Then correct log is generated after promise resolves', () => {
          expect(infoSpy).toHaveBeenCalledWith({
            message: 'successful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            result
          });
        });

        it('Then original return value is resolved', () => {
          expect(result).toBe(constructorArg);
        });
      });
    });

    describe('Given would not like to await for promise-returning method decorated with LogOnResult', () => {
      class ClassToTest {
        constructor(private readonly classField: string) {}
        @LogOnResult(logRetriever, {
          wouldLikeToAwait: false //default but making clear for purpose of test
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): Promise<string> {
          return Promise.resolve(this.classField);
        }
      }

      let constructorArg: string;
      let classToTest: ClassToTest;
      beforeEach(() => {
        constructorArg = 'yooo';
        classToTest = new ClassToTest(constructorArg);
      });

      describe('When invoking method', () => {
        let result: Promise<string>;
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

        it('Then log is generated when promise is returned rather than after promise resolves', () => {
          expect(infoSpy).toHaveBeenCalledWith({
            message: 'successful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            result
          });
        });

        it('Then promise returned and value can be resolved', () => {
          return result.then((val) => {
            expect(val).toBe(constructorArg);
          });
        });
      });
    });

    describe('Given default LogOnError options', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever)
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): void {
          throw this.error;
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let thrownError: Error;
        beforeEach(() => {
          try {
            classToTest.testLogging(
              arbitraryString,
              arbitraryNumber,
              arbitraryBoolean,
              arbitraryFunction,
              arbitraryInstance,
              arbitraryObj
            );
          } catch (e) {
            thrownError = e;
          }
        });

        it('Then correct log is generated', () => {
          expect(errorSpy).toHaveBeenCalledWith({
            message: 'unsuccessful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            error: thrownError.message
          });
        });

        it('Then original error is thrown', () => {
          expect(thrownError).toBe(errorToThrow);
        });
      });
    });

    describe('Given arg mappings for LogOnError', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever, {
          argMappings: [null, 'arbNumber', (arg: boolean) => ({ name: 'arbBool', value: !arg })]
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): void {
          throw this.error;
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let thrownError: Error;
        beforeEach(() => {
          try {
            classToTest.testLogging(
              arbitraryString,
              arbitraryNumber,
              arbitraryBoolean,
              arbitraryFunction,
              arbitraryInstance,
              arbitraryObj
            );
          } catch (e) {
            thrownError = e;
          }
        });

        it('Then correct log is generated', () => {
          expect(errorSpy).toHaveBeenCalledWith({
            message: 'unsuccessful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arbNumber: arbitraryNumber,
            arbBool: !arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            error: thrownError.message
          });
        });

        it('Then original error is thrown', () => {
          expect(thrownError).toBe(errorToThrow);
        });
      });
    });

    describe('Given error mapping for LogOnError', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever, {
          errorMapping: (e: Error) => ({ name: 'err', value: e.stack })
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): void {
          throw this.error;
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let thrownError: Error;
        beforeEach(() => {
          try {
            classToTest.testLogging(
              arbitraryString,
              arbitraryNumber,
              arbitraryBoolean,
              arbitraryFunction,
              arbitraryInstance,
              arbitraryObj
            );
          } catch (e) {
            thrownError = e;
          }
        });

        it('Then correct log is generated', () => {
          expect(errorSpy).toHaveBeenCalledWith({
            message: 'unsuccessful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            err: thrownError.stack
          });
        });

        it('Then original error is thrown', () => {
          expect(thrownError).toBe(errorToThrow);
        });
      });
    });

    describe('Given error message for LogOnError', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever, {
          errorMessage: 'I have errored'
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): void {
          throw this.error;
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let thrownError: Error;
        beforeEach(() => {
          try {
            classToTest.testLogging(
              arbitraryString,
              arbitraryNumber,
              arbitraryBoolean,
              arbitraryFunction,
              arbitraryInstance,
              arbitraryObj
            );
          } catch (e) {
            thrownError = e;
          }
        });

        it('Then correct log is generated', () => {
          expect(errorSpy).toHaveBeenCalledWith({
            message: 'I have errored',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            error: thrownError.message
          });
        });

        it('Then original error is thrown', () => {
          expect(thrownError).toBe(errorToThrow);
        });
      });
    });

    describe('Given would like to await for non-promise-returning method decorated with LogOnError', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever, {
          wouldLikeToAwait: true
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): void {
          throw this.error;
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let thrownError: Error;
        beforeEach(() => {
          try {
            classToTest.testLogging(
              arbitraryString,
              arbitraryNumber,
              arbitraryBoolean,
              arbitraryFunction,
              arbitraryInstance,
              arbitraryObj
            );
          } catch (e) {
            thrownError = e;
          }
        });

        it('Then correct log is generated', () => {
          expect(errorSpy).toHaveBeenCalledWith({
            message: 'unsuccessful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            error: thrownError.message
          });
        });

        it('Then original error is thrown', () => {
          expect(thrownError).toBe(errorToThrow);
        });
      });
    });

    describe('Given would like to await for promise-returning method decorated with LogOnError', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever, {
          wouldLikeToAwait: true
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): Promise<void> {
          return Promise.reject(this.error);
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let thrownError: Error;
        beforeEach(async () => {
          try {
            await classToTest.testLogging(
              arbitraryString,
              arbitraryNumber,
              arbitraryBoolean,
              arbitraryFunction,
              arbitraryInstance,
              arbitraryObj
            );
          } catch (e) {
            thrownError = e;
          }
        });

        it('Then correct log is generated', () => {
          expect(errorSpy).toHaveBeenCalledWith({
            message: 'unsuccessful method execution',
            class: 'ClassToTest',
            method: 'testLogging',
            arg1: arbitraryString,
            arg2: arbitraryNumber,
            arg3: arbitraryBoolean,
            arg4: arbitraryFunction,
            arg5: arbitraryInstance,
            arg6: arbitraryObj,
            error: thrownError.message
          });
        });

        it('Then original error is rejected', () => {
          expect(thrownError).toBe(errorToThrow);
        });
      });
    });

    describe('Given would not like to await for promise-returning method decorated with LogOnError', () => {
      class ClassToTest {
        constructor(private readonly error: Error) {}
        @LogOnError(logRetriever, {
          wouldLikeToAwait: false
        })
        testLogging(
          _p1: string,
          _p2: number,
          _p3: boolean,
          _p4: (arb: string) => string,
          _p5: ArbitraryClass,
          _p6: ArbitraryInterface
        ): Promise<void> {
          return Promise.reject(this.error);
        }
      }

      let errorToThrow: Error;
      let classToTest: ClassToTest;
      beforeEach(() => {
        errorToThrow = new Error('err');
        classToTest = new ClassToTest(errorToThrow);
      });

      describe('When invoking method', () => {
        let promise: Promise<void>;
        beforeEach(() => {
          promise = classToTest.testLogging(
            arbitraryString,
            arbitraryNumber,
            arbitraryBoolean,
            arbitraryFunction,
            arbitraryInstance,
            arbitraryObj
          );
        });

        it('Then no log is generated', () => {
          expect(errorSpy).not.toHaveBeenCalled();
        });

        it('Then promise is returned and will reject with original error', (done) => {
          return promise.catch((e) => {
            expect(e).toBe(errorToThrow);
            done();
          });
        });
      });
    });
  });
});
