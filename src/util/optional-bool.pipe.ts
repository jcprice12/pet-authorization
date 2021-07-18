import { ArgumentMetadata, ParseBoolPipe, PipeTransform } from '@nestjs/common';

export class ParseOptionalBoolPipe implements PipeTransform {
  async transform(value: string | boolean | undefined, metatadata: ArgumentMetadata) {
    return value ? await new ParseBoolPipe().transform(value, metatadata) : value;
  }
}
