import { Inject, Injectable, Logger } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthorizeDao } from '../authorize/authorize.dao';
import { AuthCode, ValidatableAuthCode } from '../authorize/authorize.model';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { InvalidGrantError } from './invalid-grant.error';
import { TokenType } from './token-type.enum';
import { CreateTokenDto, TokenResponse } from './token.model';

@Injectable()
export class TokenService {
  constructor(
    private readonly authorizeDao: AuthorizeDao,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass)
  async createToken(createTokenDto: CreateTokenDto): Promise<TokenResponse> {
    const authCode: AuthCode = await this.authorizeDao.getAuthCode(createTokenDto.code);
    this.validateAuthCode(authCode);
    return {
      access_token: 'todo',
      expires_in: 'todo',
      token_type: TokenType.BEARER
    };
  }

  private validateAuthCode(authCode: AuthCode): void {
    if (!authCode || validateSync(new ValidatableAuthCode(authCode)).length) {
      throw new InvalidGrantError();
    }
  }
}
