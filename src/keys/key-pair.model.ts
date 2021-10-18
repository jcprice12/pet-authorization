import { GenerateKeyPairResult } from 'jose';

export interface KeyPair extends GenerateKeyPairResult {
  kid: string;
}
