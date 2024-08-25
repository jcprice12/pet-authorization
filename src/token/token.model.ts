import { Equals, IsNotEmpty, IsOptional } from 'class-validator';
import { GrantType } from './grant-type.enum';
import { TokenType } from './token-type.enum';

export class ExchangeAuthCodeForTokensDto {
  @Equals(GrantType.AUTHORIZATION_CODE)
  grant_type: GrantType;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  client_id: string;

  @IsOptional()
  code_verifier?: string;

  @IsOptional()
  redirect_uri?: string;
}

export interface TokenResource {
  access_token: string;
  token_type: TokenType;
  expires_in: number;
  scope: string;
  id_token?: string;
}
