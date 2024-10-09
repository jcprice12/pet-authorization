import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export interface ValidEnumOptions<E> {
  optional?: boolean;
  separator?: string;
  customValidation?: (arr: Array<E>) => boolean;
}

export class ValidArrayOfEnumPipe<E> implements PipeTransform {
  constructor(
    private readonly enumSpec: any,
    private readonly options: ValidEnumOptions<E> = {}
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (this.options.optional && !value) {
      return value;
    }
    if (value && typeof value === 'string') {
      const arr = value.split(this.options.separator ?? ' ');
      if (arr.every((val) => Object.values(this.enumSpec).includes(val))) {
        if (!this.options.customValidation || this.options.customValidation(arr as Array<E>)) {
          return arr;
        }
      }
    }
    throw new BadRequestException(`provided value "${value}" is not accepted for argument "${metadata.data}"`);
  }
}
