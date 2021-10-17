import { Injectable, OnModuleInit } from '@nestjs/common';
import { generateKeyPair, GenerateKeyPairResult, KeyLike } from 'jose';
import { Algorithm } from './algorithm.enum';
import { KeyPairService } from './key-pair.service';

@Injectable()
export class LocalKeyPairService implements KeyPairService, OnModuleInit {
  private keyPair: GenerateKeyPairResult;

  async onModuleInit(): Promise<void> {
    this.keyPair = await generateKeyPair(Algorithm.RS256);
  }

  getPublicKey(): Promise<KeyLike> {
    return Promise.resolve(this.keyPair.publicKey);
  }
  getPrivateKey(): Promise<KeyLike> {
    return Promise.resolve(this.keyPair.privateKey);
  }
}
