import { Prompt } from '../../../src/authorize/prompt.enum';

export interface AuthorizeParams {
  response_type: ResponseType;
  client_id: string;
  redirect_uri: string;
  scope?: string;
  prompt?: Prompt;
}
