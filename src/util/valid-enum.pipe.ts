import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';

export class ValidEnumPipe implements PipeTransform {
  constructor(private readonly enumSpec: any) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!Object.values(this.enumSpec).includes(value)) {
      throw new BadRequestException(
        `provided value "${value}" is not accepted for argument "${metadata.data}"`
      );
    }
    return value;
  }
}
