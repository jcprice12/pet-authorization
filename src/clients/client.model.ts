import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

interface ClientBase {
  redirectUris: Array<string>;
  clientName: string;
  isConfidential: boolean;
}

export class ClientRegistrationDto implements ClientBase {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  redirectUris: string[];
  @IsNotEmpty()
  clientName: string;
  @IsBoolean()
  isConfidential: boolean;
}

export interface PublicClient extends ClientBase {
  client_id: string;
  client_id_issued_at: string;
  client_secret_expires_at?: number;
}

/*
  client_secret may be in plain text (if being returned upon client registration), or be hashed (not salted) if retrieved from database
*/
export interface Client extends PublicClient {
  client_secret?: string;
}
