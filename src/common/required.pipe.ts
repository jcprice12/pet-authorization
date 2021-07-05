import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RequiredPipe implements PipeTransform {
  transform(value: unknown, argumentMetadata: ArgumentMetadata) {
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException(`"${argumentMetadata.data}" is required`);
    }
    return value;
  }
}
