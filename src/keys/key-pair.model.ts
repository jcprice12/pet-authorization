import { GenerateKeyPairResult } from 'jose';
import { Algorithm } from './algorithm.enum';

export interface KeyPair extends GenerateKeyPairResult {
  kid: string;
  alg: Algorithm;
}
