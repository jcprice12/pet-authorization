import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Scope } from '../server-metadata/scope.enum';

export class ConsentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes: Array<Scope> = [];

  @IsNotEmpty()
  clientId: string;
}
