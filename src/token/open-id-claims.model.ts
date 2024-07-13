import { JcpetsClaims } from './jcpets.claims.model';

export interface OpenIdClaims {
  given_name: string;
  family_name: string;
  jcpets: JcpetsClaims;
  email?: string;
}
