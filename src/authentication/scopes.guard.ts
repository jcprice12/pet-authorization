import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserWithScopes } from '../users/user.model';

@Injectable()
export class HasOneOfTheGivenScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(executionContext: ExecutionContext): boolean {
    const givenScopes: Array<string> = this.getGivenScopes(executionContext);
    const user: UserWithScopes = this.getUserFromRequest(executionContext);
    return !givenScopes || this.hasAuthenticatedUserConsentedToOneOfTheGivenScopes(givenScopes, user);
  }

  private getGivenScopes(context: ExecutionContext): Array<string> {
    return this.reflector.get<string[]>('givenScopes', context.getHandler());
  }

  private getUserFromRequest(context: ExecutionContext): UserWithScopes {
    const request: Request = context.switchToHttp().getRequest();
    context.switchToHttp().getRequest();
    return request.user as UserWithScopes;
  }

  private hasAuthenticatedUserConsentedToOneOfTheGivenScopes(
    givenScopes: Array<string>,
    user?: UserWithScopes
  ): boolean {
    return !!user?.scopes?.some((consentedScope) => givenScopes.includes(consentedScope));
  }
}
