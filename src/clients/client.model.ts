import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TokenEndpointAuthMethod } from './token-endpoint-auth-method.enum';

interface ClientBase {
  redirect_uris: Array<string>;
  client_name: string;
  token_endpoint_auth_method: TokenEndpointAuthMethod;
}

export class ClientRegistrationDto implements ClientBase {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  redirect_uris: string[];
  @IsNotEmpty()
  client_name: string;
  @IsEnum(TokenEndpointAuthMethod)
  token_endpoint_auth_method: TokenEndpointAuthMethod;
}

export interface Client extends ClientBase {
  client_id: string;
  client_id_issued_at: string;
}
