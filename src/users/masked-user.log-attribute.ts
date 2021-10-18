import { User, UserRegistrationDto } from './user.model';
import { MaskedSimpleObjectLogAttribute } from '../util/simple-masked.log-attribute';

export class MaskedUserLogAttribute extends MaskedSimpleObjectLogAttribute {
  constructor(name: string, thingWithUserInfo: User | UserRegistrationDto) {
    super(name, thingWithUserInfo, ['email', 'givenName', 'familyName', 'password']);
  }
}
