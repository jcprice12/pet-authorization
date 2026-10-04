#!/bin/sh

# Give DynamoDB Local a brief window to finish mounting its internal database files
echo "Waiting for DynamoDB service initialization..."
sleep 5

TABLE_NAME="PetAuth"
ENDPOINT="http://dynamodb-local:8000"

echo "Checking if $TABLE_NAME table exists..."
# Check if the table string is actively returned in the list
aws dynamodb list-tables --endpoint-url $ENDPOINT | grep -q "\"$TABLE_NAME\""

if [ $? -ne 0 ]; then
  echo "Table $TABLE_NAME not found. Creating table..."
  
  # Capture potential error outputs cleanly
  CREATE_OUTPUT=$(aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url $ENDPOINT 2>&1)

  # Double check if someone else created it during the race window
  echo "$CREATE_OUTPUT" | grep -q "ResourceInUseException"
  if [ $? -eq 0 ]; then
    echo "Table was initialized simultaneously by internal storage tracking."
  else
    echo "Waiting for fresh table creation to finalize..."
    aws dynamodb wait table-exists --table-name $TABLE_NAME --endpoint-url $ENDPOINT
  fi
else
  echo "Table $TABLE_NAME explicitly found in storage index."
fi

# 2. Define Admin User parameters
ADMIN_ID="admin-001"
ADMIN_EMAIL="admin@jcpets.com"
ENCRYPTED_PASSWORD='$2b$10$Xh.EGLxjZGafabMusoo61ePrpA1kgunhocgLhiwvjnjzMwg3tKIAS'

echo "Upserting Admin User records..."

aws dynamodb transact-write-items --endpoint-url $ENDPOINT --transact-items '[
  {
    "Put": {
      "TableName": "PetAuth",
      "Item": {
        "pk": {"S": "user#'"$ADMIN_ID"'"},
        "sk": {"S": "user#'"$ADMIN_ID"'"},
        "email": {"S": "'"$ADMIN_EMAIL"'"},
        "given_name": {"S": "Admin"},
        "family_name": {"S": "User"},
        "password": {"S": "'"$ENCRYPTED_PASSWORD"'"},
        "roles": {"L": [{"S": "ADMIN"}]}
      }
    }
  },
  {
    "Put": {
      "TableName": "PetAuth",
      "Item": {
        "pk": {"S": "user-email#'"$ADMIN_EMAIL"'"},
        "sk": {"S": "user-email#'"$ADMIN_EMAIL"'"}
      }
    }
  }
]'

echo "Admin initialization complete!"
