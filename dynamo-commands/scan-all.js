var params = {
  TableName: 'PetAuth'
};
dynamodb.scan(params, function (err, data) {
  if (err)
    ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
