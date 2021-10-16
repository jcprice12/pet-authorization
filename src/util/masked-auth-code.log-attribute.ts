import { SimpleMaskedLogAttribute } from './simple-masked.log-attribute';

export type ThingWithCode = { code: string };

export class MaskedAuthCodeLogAttribute extends SimpleMaskedLogAttribute<ThingWithCode> {
  constructor(name: string, thingWithCode: ThingWithCode) {
    super(name, thingWithCode, 'code');
  }
}
