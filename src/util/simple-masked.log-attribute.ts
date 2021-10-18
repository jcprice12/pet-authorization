import { cloneDeep } from 'lodash';
import { LogAttributeValue } from './log-attribute-value.enum';
import { LogAttribute } from './log-attribute.model';

export class MaskedSimpleObjectLogAttribute implements LogAttribute {
  public readonly value: Record<string, any>;
  constructor(public readonly name: string, objWithFieldToMask: any, fieldsToMask: Array<string>) {
    this.value = cloneDeep(objWithFieldToMask);
    fieldsToMask.forEach((field) => {
      if (this.value[field]) {
        this.value[field] = LogAttributeValue.MASK;
      }
    });
  }
}
