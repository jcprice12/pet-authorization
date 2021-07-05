import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidEnumPipe } from './valid-enum.pipe';

const isNotValid = (expectedMessage: string) => {
  return (actual: Error) => {
    expect(actual).toBeInstanceOf(BadRequestException);
    expect(actual.message).toBe(expectedMessage);
  };
};

const isValid = (expected: string) => {
  return (actual: string) => {
    expect(actual).toBe(expected);
  };
};

const getExpectedErrorMessage = (value: string, argName: string) => {
  return `provided value "${value}" is not accepted for argument "${argName}"`;
};

describe('Given an enum and pipe for enum', () => {
  enum MyTestEnum {
    FOO = 'foo'
  }

  let pipe: ValidEnumPipe;
  beforeEach(() => {
    pipe = new ValidEnumPipe(MyTestEnum);
  });

  describe('Given an argument decorated by pipe', () => {
    const argName = 'my_name';
    let argMetadata: ArgumentMetadata;
    beforeEach(() => {
      argMetadata = {
        data: argName
      } as ArgumentMetadata;
    });

    describe.each([
      ['foo', isValid('foo')],
      ['bar', isNotValid(getExpectedErrorMessage('bar', argName))],
      ['', isNotValid(getExpectedErrorMessage('', argName))],
      [undefined, isNotValid(getExpectedErrorMessage(undefined, argName))]
    ])('Given value %s', (value, expectation) => {
      describe('When determining if value is valid', () => {
        let result: any;
        beforeEach(() => {
          try {
            result = pipe.transform(value, argMetadata);
          } catch (e) {
            result = e;
          }
        });

        it('Then the value is correctly validated', () => {
          expectation(result);
        });
      });
    });
  });
});
