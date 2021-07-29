import { cloneDeep } from 'lodash';
import { LogAttribute } from './log-attribute.model';

export class MaskedPasswordLogAttribute implements LogAttribute {
  public readonly value: { password: string };
  constructor(public readonly name: string, thingWithPassword: { password: string }) {
    this.value = cloneDeep(thingWithPassword);
    this.value.password = '****';
  }
}
