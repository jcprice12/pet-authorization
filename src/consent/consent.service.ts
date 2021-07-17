import { AttributeValue, DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsentService {
  private readonly tableName = 'PetAuth';

  constructor(private readonly dynamoClient: DynamoDBClient) {}

  async hasUserConsentedToScopes(userId: string, scopes: Array<string>): Promise<boolean> {
    const output = await this.dynamoClient.send(
      new QueryCommand({
        TableName: this.tableName,
        ExpressionAttributeValues: marshall({
          pk: `user#${userId}`,
          scope: 'scope#'
        }),
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :scope)'
      })
    );
    const consentedScopes = this.mapItemsToConsentedScopes(output.Items);
    return scopes.every((scope) => consentedScopes.includes(scope));
  }

  private mapItemsToConsentedScopes(
    items: Array<{ [key: string]: AttributeValue }>
  ): Array<string> {
    return items
      .map((item) => unmarshall(item))
      .filter((userScope) => userScope.consented === true)
      .map((consentedUserScope) => consentedUserScope.sk.split('#')[1]);
  }
}
