import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export interface ValidEnumOptions<E> {
  optional?: boolean;
  separator?: string;
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
        return arr;
      }
    }
    throw new BadRequestException(`provided value "${value}" is not accepted for argument "${metadata.data}"`);
  }
}
