import { MaskedSimpleObjectLogAttribute } from '../util/simple-masked.log-attribute';

export class MaskedAuthCodeLogAttribute extends MaskedSimpleObjectLogAttribute {
  constructor(name: string, authCode: { code: string }) {
    super(name, authCode, ['code']);
  }
}
