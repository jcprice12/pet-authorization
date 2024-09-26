## Description

OAuth and Identity Provider Server for the pet-adoption website.

## Local development

Follow the below guides to get started.

### Local Development with Docker

#### Prerequisites

##### Docker Desktop

For local development, I use Docker Desktop. After installing it, simply run it on your host to start the Docker daemon.

#### Running the app with Docker Compose

While in the app directory, run `docker compose up --watch`. It should set up your complete development environment. Note, the `aws-cli` service will fail on subsequent runs because the `PetAuth` table will have already been created. That's fine. It doesn't prevent the rest of the services from running.

Run `docker compose down` when you're finished to cleanup your containers

### Local Development without Docker

If you're crazy, feel free to set up each of the components of the app on your own

#### Prerequisites

##### Node Modules

```bash
$ npm install
```

##### Dynamo

You need to have a local DynamoDB instance running on port 8000. I have chosen to use [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) for this. Follow the documentation on AWS's website to install it.

Note, at the time of this writing, I am using version 1.16.0. That version comes with a shell (http://localhost:8000/shell/). Later versions (like the one my Docker Compose file is using) don't come with a shell.

To start running DynamoDB locally, run the following commmand:

```
java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

Personally, I set up an alias called "dyno" that I can run in a bash shell by adding the following to my .bashrc file:

```
alias dyno="java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

You will also need to setup the actual table that this app uses. You can look through the code to determine things like what the table name should be and what the indexes are; however, I would recommend getting all that information by taking a look at either the `jest-dynalite-config.js` or `create-table.sh` files.

I have placed some example DynamoDB commands in the `dynamo-commands` folder. Use those in the local DynamoDB shell if it's available to you. Otherwise, download the [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and use that to interact with your table.

#### Running the app locally.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

### Unit Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Manual

#### Clients

```
// register

POST http://localhost:3000/clients

// request body
{
  "redirect_uris": [
    "http://localhost:3333/callback"
  ],
  "client_name": "JCPets UI",
  "token_endpoint_auth_method": "none"
}
```

#### Authorize

Note, the following requests will redirect you to an address that doesn't exist. That's intentional since I don't have an actual OAuth client to redirect to.

```
// login
GET http://localhost:3000/authorize?response_type=code&client_id=b80c6136-c23b-4702-95d0-0962ecfabf6a&scope=openid%20jcpets:roles%20jcpets:pets:write&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=login

// consent
GET http://localhost:3000/authorize?response_type=code&client_id=b80c6136-c23b-4702-95d0-0962ecfabf6a&scope=openid%20jcpets:roles%20jcpets:pets:write&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=consent

// get auth code
GET http://localhost:3000/authorize?response_type=code&client_id=b80c6136-c23b-4702-95d0-0962ecfabf6a&scope=openid%20jcpets:roles%20jcpets:pets:write&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=none
```

#### Token

```
POST http://localhost:3000/token

// request body
{
  "grant_type": "authorization_code",
  "code": "cf93058a-4826-4b8b-af2a-7b1bc2c7bfe7",
  "redirect_uri": "http://localhost:3000/callback",
  "client_id": "b80c6136-c23b-4702-95d0-0962ecfabf6a"
}
```

#### Keys

```
GET http://localhost:3000/keys
```

## TODO

- verify pkce flow works
- verify state param works
- implement production key pair service.
- setup production domain
- change server metadata endpoint to be /.well-known/openid-configuration
