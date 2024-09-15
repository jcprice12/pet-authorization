## Description

OAuth and Identity Provider Server for the pet-adoption website.

## Installation

```bash
$ npm install
```

## Dynamo

This app uses DynamoDB. For local development (NODE_ENV === 'local'), you need to have a local DynamoDB instance running on port 8000.

To set up DynamoDB local, visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html. You can access the shell at http://localhost:8000/shell/. To start running DynamoDB locally, run the following commmand:

```
java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

Personally, I set up an alias called "dyno" that I can run in a bash shell by adding the following to my .bashrc file:

```
alias dyno="java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

You will also need to setup the actual table that this app uses. You can look through the code to determine things like what the table name should be and what the indexes are; however, I would recommend getting all that information by taking a look at the jest-dynalite-config.js file.

I have placed some example DynamoDB commands in the `dynamo-commands` folder. Use those in the local DynamoDB shell.

## Running the app

Note, you must have an instance of dynamo that the app can connect to.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

### Commands

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Manual

#### Authorize

Note, the following requests will redirect you to an address that doesn't exist. That's intentional since I don't have an actual OAuth client to redirect to.

```
// login
GET http://localhost:3000/authorize?response_type=code&client_id=1a2016d6-c5a3-4b24-a18d-58de3d5b5110&scope=openid%20jcpets.roles&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=login

// consent
GET http://localhost:3000/authorize?response_type=code&client_id=1a2016d6-c5a3-4b24-a18d-58de3d5b5110&scope=openid%20jcpets.roles&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=consent

// get auth code
GET http://localhost:3000/authorize?response_type=code&client_id=1a2016d6-c5a3-4b24-a18d-58de3d5b5110&scope=openid%20jcpets.roles&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=none
```

#### Token

```
POST http://localhost:3000/token

// request body
{
  "grant_type": "authorization_code",
  "code": "cf93058a-4826-4b8b-af2a-7b1bc2c7bfe7",
  "redirect_uri": "http://localhost:3000/foo/",
  "client_id": "1234"
}

// response
{
    "access_token": "encoded.access.token",
    "scope": "openid",
    "expires_in": 600,
    "token_type": "bearer",
    "id_token": "encoded.oidc.token" // present if "openid" scope included
}

// decoded access token header
{
  "alg": "RS256"
}

// decoded access token payload
{
  "scope": "openid",
  "iat": 1656190231,
  "sub": "869fcc22-febe-4a99-9297-e61a5533b0b4",// user id
  "exp": 1656190831855
}

// decoded id token header
{
  "alg": "RS256"
}

// decoded id token payload
{
  "iat": 1656190231,
  "sub": "869fcc22-febe-4a99-9297-e61a5533b0b4",// user id
  "aud": "1234",// client id
  "exp": 1656190831858
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
- change server metadata endpoint to be /.well-known/openid-configuration
- research way to tell consumers how to get public key to verify tokens (included in JWTs?). "kid" claim? "iss" claim?
  - look at the "JWS" RFC: https://datatracker.ietf.org/doc/html/rfc7515#section-4. Ultimately, resource providers need to "hard code" which OAuth servers and IDP's they trust (or get that info from a source that is not the JWT).
    - Base on on Spring Boot documentation (https://docs.spring.io/spring-security/reference/reactive/oauth2/resource-server/jwt.html), I should implement:
      - The "iss" claim in the JWT body/payload. Should be the URL of the OAuth server (E.G. http://localhost:3000).
      - implement the "nbf" claim on the body/payload of the JWT
      - The "jwks_uri" field in the server metadata endpoint.
    - Based off my own hunch, I should probably implement the following:
      - the "kid" claim in the JWT header. Use this during JWT verification to select the correct key from the /keys endpoint
      - the "jku" claim in the JWT header. This should be the exact URI of the /keys endpoint. This header really isn't needed, but may be good to include for a sanity check during JWT verification.

