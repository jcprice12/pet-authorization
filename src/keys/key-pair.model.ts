import { GenerateKeyPairResult } from 'jose';
import { Algorithm } from './algorithm.enum';

/**
 * This is my own extension of a key pair (not standard).
 * I use it to label a key pair with an ID ("kid"), and what algorithm was used.
 * This is because that information is not available on the jose GeneratedKeyPairResult type
 */
export interface KeyPair extends GenerateKeyPairResult {
  kid: string;
  alg: Algorithm;
}
