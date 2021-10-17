import { KeyLike } from 'jose';

export interface KeyPairService {
  getPublicKey(): Promise<KeyLike>;
  getPrivateKey(): Promise<KeyLike>;
}
