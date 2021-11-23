import { Equals, IsNotEmpty, IsUrl } from 'class-validator';
import { GrantType } from './grant-type.enum';
import { TokenType } from './token-type.enum';

export class ExchangeAuthCodeForTokensDto {
  @Equals(GrantType.AUTHORIZATION_CODE)
  grant_type: GrantType;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsUrl()
  redirect_uri: string;

  @IsNotEmpty()
  client_id: string;
}

export interface TokenResource {
  access_token: string;
  token_type: TokenType;
  expires_in: number;
  scope: string;
  id_token?: string;
}
