var params = {
  TableName: 'PetAuth',
  IndexName: 'Email-index', // optional (if querying an index)
  KeyConditionExpression: 'email = :value', // a string representing a constraint on the attribute
  ExpressionAttributeValues: {
    // a map of substitutions for all attribute values
    ':value': 'john' // yes, I know this isn't an email
  }
};
docClient.query(params, function (err, data) {
  if (err)
    ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
