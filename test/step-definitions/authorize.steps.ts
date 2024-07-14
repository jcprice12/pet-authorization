import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { DateTime } from 'luxon';
import { TokenEndpointAuthMethod } from '../../src/clients/token-endpoint-auth-method.enum';
import { createApp } from './shared/app-setup';
import { World } from './shared/world';

const feature = loadFeature('test/features/authorize.feature');

const queryParamsNotGood = (url: URL, params: { name: string; value: string }[]) => {
  return !params.every((param) => {
    const actualParamValue = url.searchParams.get(param.name);
    const regex = new RegExp(`^${param.value}$`);
    return regex.test(actualParamValue);
  });
};

defineFeature(feature, (test) => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
    await app.init();
    const world = World.getInstance();
    world.app = app;
    world.server = app.getHttpServer();
  });

  afterEach(() => {
    World.reset();
  });

  afterAll(() => {
    app.get(DynamoDBClient).destroy(); //dynalite hangs if you don't do this
  });

  const givenClientWithIdAndRedirectUri = (given) => {
    given(/^client with ID "(.+)" and redirect URI "(.+)"$/, async (client_id, redirectUri) => {
      const dynamoClient = app.get(DynamoDBClient);
      await dynamoClient.send(
        new PutItemCommand({
          TableName: 'PetAuth',
          Item: marshall({
            pk: `client#${client_id}`,
            sk: `client#${client_id}`,
            client_id,
            client_id_issued_at: DateTime.utc().toISO(),
            redirect_uris: [redirectUri],
            client_name: 'Test Client',
            token_endpoint_auth_method: TokenEndpointAuthMethod.NONE
          })
        })
      );
    });
  };

  const givenResourceOwnerRegisters = (given, world: World = World.getInstance()) => {
    given(/^resource owner registers with email "(.+)" and password "(.+)"$/, (email, password) => {
      return world.useSuperTestAgent(email).post('/users/register').send({
        email,
        password,
        given_name: 'foo',
        family_name: 'bar'
      });
    });
  };

  const givenResourceOwnerLogsIn = (given, world: World = World.getInstance()) => {
    given(/^resource owner logs in with email "(.+)" and password "(.+)"$/, (email, password) => {
      return world.useSuperTestAgent(email).post('/users/login').send({
        email,
        password
      });
    });
  };

  const givenResourceOwnerConsentsTo = (given, world: World = World.getInstance()) => {
    given(
      /^resource owner with email "(.+)" consents to the following scopes for client "(.+)":$/,
      (email, clientId, scopesTable: { scope: string }[]) => {
        return world
          .useSuperTestAgent(email)
          .post('/users/consent')
          .send({
            scopes: scopesTable.map((scopeRow) => scopeRow.scope),
            clientId
          });
      }
    );
  };

  const whenAuthorizeRequestMade = (when, world: World = World.getInstance()) => {
    when(
      /^client makes a request to the authorize endpoint with the following parameters(?::)|(?: for resource owner "(.+)":)$/,
      (agentKey: string, table: any[]) => {
        world.superTest = world
          .useSuperTestAgent(agentKey ?? 'unauthenticated')
          .get('/authorize')
          .query(table[0]);
      }
    );
  };

  const thenRedirectMadeWithFollowingParams = (then, world: World = World.getInstance()) => {
    then(
      /^a redirect is made to "(.+)" with the following params:$/,
      (redirect_to, paramsTable: { name: string; value: string }[]) => {
        return new Promise((resolve, reject) => {
          world.superTest.expect(302, (err, res) => {
            if (err) {
              reject('error occurred during request');
            }
            const location: string = res.headers.location;
            let url: URL;
            let redirectLocationNotGood: () => boolean;
            try {
              url = new URL(location);
              redirectLocationNotGood = () => url.origin + url.pathname !== redirect_to;
            } catch (e) {
              url = new URL(location, 'http://localhost'); //dummy valid url - only used to get query params easily
              redirectLocationNotGood = () => url.pathname !== redirect_to;
            }
            if (redirectLocationNotGood()) {
              reject('redirect not made to correct path');
            } else if (queryParamsNotGood(url, paramsTable)) {
              reject('not every query param correct');
            } else {
              resolve(res);
            }
          });
        });
      }
    );
  };

  test('Unauthenticated request leads to redirect with error', ({ given, when, then }) => {
    givenClientWithIdAndRedirectUri(given);
    whenAuthorizeRequestMade(when);
    thenRedirectMadeWithFollowingParams(then);
  });

  test('Request with login prompt leads to redirect to login page', ({ given, when, then }) => {
    givenClientWithIdAndRedirectUri(given);
    whenAuthorizeRequestMade(when);
    thenRedirectMadeWithFollowingParams(then);
  });

  test('Authenticated request for scope not consented to leads to redirect with error', ({ given, when, then }) => {
    givenClientWithIdAndRedirectUri(given);
    givenResourceOwnerRegisters(given);
    givenResourceOwnerLogsIn(given);
    whenAuthorizeRequestMade(when);
    thenRedirectMadeWithFollowingParams(then);
  });

  test('Authenticated request with consent prompt leads to redirect to consent page', ({ given, when, then }) => {
    givenClientWithIdAndRedirectUri(given);
    givenResourceOwnerRegisters(given);
    givenResourceOwnerLogsIn(given);
    whenAuthorizeRequestMade(when);
    thenRedirectMadeWithFollowingParams(then);
  });

  test('Authenticated request for consented scopes leads to redirect with auth code', ({ given, when, then }) => {
    givenClientWithIdAndRedirectUri(given);
    givenResourceOwnerRegisters(given);
    givenResourceOwnerLogsIn(given);
    givenResourceOwnerConsentsTo(given);
    whenAuthorizeRequestMade(when);
    thenRedirectMadeWithFollowingParams(then);
  });
});
