import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthorizeDao } from '../authorize/authorize.dao';
import { AuthCode } from '../authorize/authorize.model';
import { MaskedAuthCodeLogAttribute } from '../authorize/masked-auth-code.log-attribute';
import { ExpirationService } from '../util/expiration.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { InvalidGrantError } from './invalid-grant.error';
import { TokenType } from './token-type.enum';
import { CreateTokenDto, TokenResponse } from './token.model';

@Injectable()
export class TokenService {
  constructor(
    private readonly authorizeDao: AuthorizeDao,
    private readonly expirationService: ExpirationService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [(arg: CreateTokenDto) => new MaskedAuthCodeLogAttribute('createTokenDto', arg)]
  })
  async issueTokens(createTokenDto: CreateTokenDto): Promise<TokenResponse> {
    const authCode: AuthCode = await this.authorizeDao.getAuthCode(createTokenDto.code);
    this.validateAuthCode(authCode);
    return {
      access_token: 'todo',
      expires_in: 'todo',
      token_type: TokenType.BEARER
    };
  }

  private validateAuthCode(authCode: AuthCode): void {
    if (!authCode || this.expirationService.isExpired(authCode.expires)) {
      throw new InvalidGrantError();
    }
  }
}
