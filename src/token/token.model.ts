import { IsEnum, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import { GrantType } from './grant-type.enum';
import { TokenType } from './token-type.enum';

const isAuthCodeGrantType = (createTokenDto: CreateTokenDto) =>
  createTokenDto.grant_type === GrantType.AUTHORIZATION_CODE;

export class CreateTokenDto {
  @IsEnum(GrantType)
  grant_type: GrantType;

  @ValidateIf(isAuthCodeGrantType)
  @IsNotEmpty()
  code: string;

  @ValidateIf(isAuthCodeGrantType)
  @IsNotEmpty()
  @IsUrl()
  redirect_uri: string;

  @ValidateIf(isAuthCodeGrantType)
  @IsNotEmpty()
  client_id: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: TokenType;
  expires_in: number;
  scope: string;
  id_token?: string;
}
