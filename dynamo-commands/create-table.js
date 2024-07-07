var params = {
  TableName: 'PetAuth',
  KeySchema: [
    {
      AttributeName: 'pk',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'sk',
      KeyType: 'RANGE'
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'pk',
      AttributeType: 'S' // (S | N | B) for string, number, binary
    },
    {
      AttributeName: 'sk',
      AttributeType: 'S'
    },
    {
      AttributeName: 'email',
      AttributeType: 'S'
    }
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'Email-index',
      KeySchema: [
        {
          AttributeName: 'email',
          KeyType: 'HASH'
        }
      ],
      Projection: {
        ProjectionType: 'ALL' // (ALL | KEYS_ONLY | INCLUDE)
      },
      ProvisionedThroughput: {
        // throughput to provision to the index
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    },
    {
      IndexName: 'SortKey-index',
      KeySchema: [
        {
          AttributeName: 'sk',
          KeyType: 'HASH'
        }
      ],
      Projection: {
        ProjectionType: 'ALL'
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ]
};
dynamodb.createTable(params, function (err, data) {
  if (err)
    ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
