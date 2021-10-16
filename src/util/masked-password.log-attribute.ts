import { SimpleMaskedLogAttribute } from './simple-masked.log-attribute';

export type ThingWithPassword = { password: string };

export class MaskedPasswordLogAttribute extends SimpleMaskedLogAttribute<ThingWithPassword> {
  constructor(name: string, thingWithPassword: ThingWithPassword) {
    super(name, thingWithPassword, 'password');
  }
}
