import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConsentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes: Array<string> = [];

  @IsNotEmpty()
  clientId: string;
}
