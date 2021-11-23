import { Body, Controller, Inject, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { ExchangeAuthCodeForTokensDto, TokenResource } from './token.model';
import { TokenService } from './token.service';

@Controller('/token')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @Post('/')
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogPromise(retrieveLoggerOnClass)
  issueTokens(@Body() exchangeAuthCodeForTokensDto: ExchangeAuthCodeForTokensDto): Promise<TokenResource> {
    return this.tokenService.exchangeAuthCodeForTokens(exchangeAuthCodeForTokensDto);
  }
}
