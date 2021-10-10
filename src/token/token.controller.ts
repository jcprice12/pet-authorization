import { Body, Controller, Inject, Logger, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { CreateTokenDto, TokenResponse } from './token.model';
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
  async issueTokens(@Body() createTokenDto: CreateTokenDto): Promise<TokenResponse> {
    return this.tokenService.issueTokens(createTokenDto);
  }
}
