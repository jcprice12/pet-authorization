import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export interface ValidEnumOptions {
  optional?: boolean;
}

export class ValidEnumPipe implements PipeTransform {
  constructor(
    private readonly enumSpec: any,
    private readonly options: ValidEnumOptions = {}
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (this.options.optional && !value) {
      return value;
    }
    if (!Object.values(this.enumSpec).includes(value)) {
      throw new BadRequestException(`provided value "${value}" is not accepted for argument "${metadata.data}"`);
    }
    return value;
  }
}
