import { SetMetadata } from '@nestjs/common';

export const GivenScopes = (...givenScopes: string[]) => SetMetadata('givenScopes', givenScopes);
