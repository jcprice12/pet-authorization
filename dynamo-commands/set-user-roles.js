var params = {
  TableName: 'PetAuth',
  Key: {
    pk: 'user#9fb240d9-5dd4-4ae5-a939-8ceea7f77fc3',
    sk: 'user#9fb240d9-5dd4-4ae5-a939-8ceea7f77fc3'
  },
  UpdateExpression: 'set #roles = :roles',
  ExpressionAttributeNames: {
    '#roles': 'roles'
  },
  ExpressionAttributeValues: {
    ':roles': ['ADMIN']
  },
  ReturnValues: 'UPDATED_NEW'
};
docClient.update(params, function (err, data) {
  if (err)
    ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
