import { Controller, Get } from '@nestjs/common';
import { JWKS } from './jwks.model';
import { KeysService } from './keys.service';

@Controller('/keys')
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  @Get('/')
  getKeySet(): JWKS {
    return this.keysService.getKeySet();
  }
}
