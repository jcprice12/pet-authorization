var params = {
  TableName: 'PetAuth',
  FilterExpression: 'begins_with(pk, :client)',
  ExpressionAttributeValues: { ':client': { S: 'client#' } },
  ReturnConsumedCapacity: 'TOTAL'
};
dynamodb.scan(params, function (err, data) {
  if (err)
    ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
