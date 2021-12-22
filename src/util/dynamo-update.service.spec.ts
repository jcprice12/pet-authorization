import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { Test, TestingModule } from '@nestjs/testing';
import { DynamoUpdateService } from './dynamo-update.service';

describe('Dynamo Update Service', () => {
  let service: DynamoUpdateService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [DynamoUpdateService]
    }).compile();

    service = testingModule.get<DynamoUpdateService>(DynamoUpdateService);
  });

  describe('Given a table, key definition, and item to update', () => {
    let item: Record<string, any>;
    let isDynamoKey: (keyName: string) => boolean;
    let tableName: string;
    beforeEach(() => {
      tableName = 'foo';
      isDynamoKey = (keyName: string) => keyName === 'pk' || keyName === 'sk';
      item = {
        pk: '123',
        sk: '321',
        myStringValue: 'john',
        myUndefinedValue: undefined,
        myFalseValue: false,
        myEmptyStringValue: '',
        myObjectValue: {
          dude: 'where is my car',
          bro: undefined
        }
      };
    });

    describe('When creating a basic update command for the item', () => {
      let basicUpdate: UpdateItemCommand;
      beforeEach(() => {
        basicUpdate = service.buildBasicUpdateCommand(tableName, item, isDynamoKey);
      });

      it('Then the correct update command is made', () => {
        expect(basicUpdate.input).toEqual({
          TableName: tableName,
          Key: {
            pk: {
              S: '123'
            },
            sk: {
              S: '321'
            }
          },
          UpdateExpression:
            'SET #myStringValue = :myStringValue, #myFalseValue = :myFalseValue, #myObjectValue = :myObjectValue',
          ConditionExpression: '#pk = :pk AND #sk = :sk',
          ExpressionAttributeNames: {
            '#myStringValue': 'myStringValue',
            '#myFalseValue': 'myFalseValue',
            '#pk': 'pk',
            '#sk': 'sk',
            '#myObjectValue': 'myObjectValue'
          },
          ExpressionAttributeValues: {
            ':pk': {
              S: '123'
            },
            ':sk': {
              S: '321'
            },
            ':myStringValue': {
              S: 'john'
            },
            ':myFalseValue': {
              BOOL: false
            },
            ':myObjectValue': {
              M: {
                dude: {
                  S: 'where is my car'
                }
              }
            }
          }
        });
      });
    });
  });
});
