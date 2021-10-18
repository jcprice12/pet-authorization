import { Injectable, OnModuleInit } from '@nestjs/common';
import { generateKeyPair } from 'jose';
import { Algorithm } from './algorithm.enum';
import { KeyPair } from './key-pair.model';
import { KeyPairService } from './key-pair.service';

@Injectable()
export class LocalKeyPairService implements KeyPairService, OnModuleInit {
  private keyPair: KeyPair;

  async onModuleInit(): Promise<void> {
    this.keyPair = {
      ...(await generateKeyPair(Algorithm.RS256)),
      kid: 'local-key'
    };
  }

  getKeyPair(): Promise<KeyPair> {
    return Promise.resolve(this.keyPair);
  }
}
