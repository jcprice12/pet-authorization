import { KeyPair } from './key-pair.model';

export interface KeyPairService {
  getKeyPair(): Promise<KeyPair>;
}
