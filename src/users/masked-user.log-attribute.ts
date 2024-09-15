import { MaskedSimpleObjectLogAttribute } from '../util/simple-masked.log-attribute';
import { User, UserRegistrationDto } from './user.model';

export class MaskedUserLogAttribute extends MaskedSimpleObjectLogAttribute {
  constructor(name: string, thingWithUserInfo: User | UserRegistrationDto) {
    super(name, thingWithUserInfo, ['email', 'given_name', 'family_name', 'password']);
  }
}
