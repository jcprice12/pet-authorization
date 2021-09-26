import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export interface ValidEnumOptions {
  isOptional?: boolean;
}

export class ValidEnumPipe implements PipeTransform {
  constructor(private readonly enumSpec: any, private readonly options: ValidEnumOptions = {}) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (this.options.isOptional && !value) {
      return value;
    }
    if (!Object.values(this.enumSpec).includes(value)) {
      throw new BadRequestException(`provided value "${value}" is not accepted for argument "${metadata.data}"`);
    }
    return value;
  }
}
