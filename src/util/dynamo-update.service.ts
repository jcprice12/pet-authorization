import { AttributeValue, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DynamoUpdateService {
  private readonly namePrefix = '#';
  private readonly valuePrefix = ':';
  private readonly keyValueMapper = ([key, value]) => ({ [key]: value });
  private readonly objectReducer = (previous, current) => ({ ...previous, ...current });
  private readonly valueExistsPredicate = ([_key, value]) => this.doesValueExist(value);
  private readonly keyToNameValueStringMapper = ([key, _value]) =>
    `${this.namePrefix}${key} = ${this.valuePrefix}${key}`;

  buildBasicUpdateCommand(
    tableName: string,
    item: Record<string, any>,
    isDynamoKey: (keyName: string) => boolean
  ): UpdateItemCommand {
    return new UpdateItemCommand({
      TableName: tableName,
      Key: this.buildKey(item, isDynamoKey),
      UpdateExpression: this.buildBasicUpdateExpression(item, isDynamoKey),
      ExpressionAttributeNames: this.buildExpressionAttributeNamesForBasicUpdate(item),
      ExpressionAttributeValues: this.buildExpressionAttributeValuesForBasicUpdate(item),
      ConditionExpression: this.buildConditionExpressionForExistingItem(item, isDynamoKey)
    });
  }

  private buildKey(
    item: Record<string, any>,
    isDynamoKey: (keyName: string) => boolean
  ): {
    [key: string]: AttributeValue;
  } {
    return marshall(
      Object.entries(item)
        .filter(([key]) => isDynamoKey(key))
        .map(this.keyValueMapper)
        .reduce(this.objectReducer, {})
    );
  }

  private buildBasicUpdateExpression(item: Record<string, any>, isDynamoKey: (keyName: string) => boolean): string {
    return `SET 
      ${Object.entries(item)
        .filter(this.valueExistsPredicate)
        .filter(([key]) => !isDynamoKey(key))
        .map(this.keyToNameValueStringMapper)
        .join(', ')}`;
  }

  private buildExpressionAttributeNamesForBasicUpdate(item: Record<string, any>): {
    [key: string]: string;
  } {
    return Object.entries(item)
      .filter(this.valueExistsPredicate)
      .map(this.keyValueMapper)
      .reduce(this.objectReducer, {});
  }

  private buildExpressionAttributeValuesForBasicUpdate(item: Record<string, any>): {
    [key: string]: AttributeValue;
  } {
    return marshall(
      Object.entries(item).filter(this.valueExistsPredicate).map(this.keyValueMapper).reduce(this.objectReducer, {})
    );
  }

  private buildConditionExpressionForExistingItem(
    item: Record<string, any>,
    isDynamoKey: (keyName: string) => boolean
  ): string {
    return Object.entries(item)
      .filter(([key]) => isDynamoKey(key))
      .map(this.keyToNameValueStringMapper)
      .join(' AND');
  }

  private doesValueExist(value: unknown): boolean {
    return value !== undefined && value !== null && value !== '';
  }
}
