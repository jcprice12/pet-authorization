import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidArrayOfEnumPipe } from './valid-array-of-enum.pipe';

enum MyTestEnum {
  FOO = 'foo',
  BAR = 'bar'
}

const isNotValid = (expectedMessage: string) => {
  return (actual: Error) => {
    expect(actual).toBeInstanceOf(BadRequestException);
    expect(actual.message).toBe(expectedMessage);
  };
};

const isValid = (expected: unknown) => {
  return (actual: string) => {
    expect(actual).toEqual(expected);
  };
};

const getExpectedErrorMessage = (value: string, argName: string) => {
  return `provided value "${value}" is not accepted for argument "${argName}"`;
};

describe('Given a pipe that allows value to be optional', () => {
  let pipe: ValidArrayOfEnumPipe<MyTestEnum>;
  beforeEach(() => {
    pipe = new ValidArrayOfEnumPipe(MyTestEnum, { optional: true });
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
      ['foo', isValid([MyTestEnum.FOO])],
      ['foo bar', isValid([MyTestEnum.FOO, MyTestEnum.BAR])],
      ['bar', isValid([MyTestEnum.BAR])],
      ['baz', isNotValid(getExpectedErrorMessage('baz', argName))],
      ['', isValid('')],
      [undefined, isValid(undefined)]
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
