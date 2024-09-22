#!/bin/bash

# Wait for DynamoDB Local to start
sleep 5

# Create a DynamoDB table using the AWS CLI
aws dynamodb create-table \
    --table-name PetAuth \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=sk,AttributeType=S \
        AttributeName=email,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=sk,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --global-secondary-indexes \
        'IndexName=Email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=1,WriteCapacityUnits=1}' \
        'IndexName=SortKey-index,KeySchema=[{AttributeName=sk,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=1,WriteCapacityUnits=1}' \
    --endpoint-url http://dynamodb-local:8000

echo "DynamoDB table created."