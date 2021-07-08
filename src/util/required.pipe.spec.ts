import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { RequiredPipe } from './required.pipe';

const isNotValid = (expectedMessage: string) => {
  return (actual: Error) => {
    expect(actual).toBeInstanceOf(BadRequestException);
    expect(actual.message).toBe(expectedMessage);
  };
};

const isValid = (expected) => {
  return (actual) => {
    expect(actual).toBe(expected);
  };
};

const getExpectedErrorMessage = (value) => {
  return `"${value}" is required`;
};

describe('Given pipe for required value', () => {
  let pipe: RequiredPipe;
  beforeEach(() => {
    pipe = new RequiredPipe();
  });

  describe('Given argument is decorated with pipe', () => {
    const argName = 'my_name';
    let argMetadata: ArgumentMetadata;
    beforeEach(() => {
      argMetadata = {
        data: argName
      } as ArgumentMetadata;
    });

    describe.each([
      ['foo', isValid('foo')],
      [0, isValid(0)],
      [false, isValid(false)],
      ['', isNotValid(getExpectedErrorMessage(argName))],
      [undefined, isNotValid(getExpectedErrorMessage(argName))],
      [null, isNotValid(getExpectedErrorMessage(argName))]
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

        it('Then the pipe validates the value', () => {
          expectation(result);
        });
      });
    });
  });
});
