import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Scope } from '../server-metadata/scope.enum';

export class ConsentDto {
  @IsOptional()
  @IsArray()
  @IsEnum(Scope, { each: true })
  scopes: Array<Scope> = [];

  @IsNotEmpty()
  clientId: string;
}
