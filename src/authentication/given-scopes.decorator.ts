import { SetMetadata } from '@nestjs/common';
import { Scope } from '../server-metadata/scope.enum';

export const GivenScopes = (...givenScopes: Scope[]) => SetMetadata('givenScopes', givenScopes);
