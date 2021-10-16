import { cloneDeep } from 'lodash';
import { LogAttributeValue } from './log-attribute-value.enum';
import { LogAttribute } from './log-attribute.model';

export class SimpleMaskedLogAttribute<T> implements LogAttribute {
  public readonly value: T;
  constructor(public readonly name: string, objWithFieldToMask: T, fieldToMask: string) {
    this.value = cloneDeep(objWithFieldToMask);
    this.value[fieldToMask] = LogAttributeValue.MASK;
  }
}
