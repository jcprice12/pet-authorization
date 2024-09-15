import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from 'winston';
import { Scope, ScopeRoles } from '../server-metadata/scope.enum';
import { HashService } from '../util/hash.service';
import { LogPromise } from '../util/log.decorator';
import { retrieveLoggerOnClass } from '../util/logger.retriever';
import { MaskedUserLogAttribute } from './masked-user.log-attribute';
import { PublicUser, User, UserRegistrationDto } from './user.model';
import { UsersDao } from './users.dao';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly hashService: HashService,
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger
  ) {}

  @LogPromise(retrieveLoggerOnClass, {
    resultMapping: (result) => new MaskedUserLogAttribute('result', result)
  })
  async getPublicUserById(id: string): Promise<PublicUser> {
    return this.mapUserToPublicUser(await this.usersDao.findUserById(id));
  }

  @LogPromise(retrieveLoggerOnClass, {
    argMappings: [(arg: UserRegistrationDto) => new MaskedUserLogAttribute('arg1', arg)]
  })
  async registerUser(userRegistrationDto: UserRegistrationDto): Promise<PublicUser> {
    const user: User = {
      ...userRegistrationDto,
      roles: [],
      id: uuidv4(),
      password: await this.hashService.hashWithSalt(userRegistrationDto.password)
    };
    return this.mapUserToPublicUser(await this.usersDao.insertUser(user));
  }

  @LogPromise(retrieveLoggerOnClass)
  async getAuthorizedScopesUserAndClient(userId: string, clientId: string, scopes: Array<Scope>) {
    try {
      const [clientInfoForUser, user] = await Promise.all([
        this.usersDao.findClientInfoForUser(userId, clientId),
        this.usersDao.findUserById(userId)
      ]);
      return scopes.filter(
        (scope) =>
          clientInfoForUser.scopes.includes(scope) &&
          (!ScopeRoles[scope].length || ScopeRoles[scope].some((role) => user.roles.includes(role)))
      );
    } catch (e) {
      return [];
    }
  }

  public mapUserToPublicUser(user: User): PublicUser {
    const { password, ...everythingElse } = user;
    return everythingElse;
  }
}
