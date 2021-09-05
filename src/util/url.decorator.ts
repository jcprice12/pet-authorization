import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

function getBaseURL(request: Request) {
  return new URL(`${request.protocol}://${request.get('host')}`);
}

export const FullURL = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return new URL(request.url, getBaseURL(request));
});
