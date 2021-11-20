import { Logger } from 'winston';
import { LogOnArrival, LogOnResult } from './log.decorator';

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
  });
});
