import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { INestApplication } from '@nestjs/common';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { createApp } from './shared/app-setup';
import { World } from './shared/world';

const feature = loadFeature('test/features/authorize.feature');

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

  const givenResourceOwnerRegisters = (given, world: World = World.getInstance()) => {
    given(/^resource owner registers with email "(.+)" and password "(.+)"$/, (email, password) => {
      return world.useSuperAgentTest(email).post('/user/register').send({
        email,
        password,
        givenName: 'foo',
        familyName: 'bar'
      });
    });
  };

  const givenResourceOwnerLogsIn = (given, world: World = World.getInstance()) => {
    given(/^resource owner logs in with email "(.+)" and password "(.+)"$/, (email, password) => {
      return world.useSuperAgentTest(email).post('/user/login').send({
        email,
        password
      });
    });
  };

  const givenResourceOwnerConsentsTo = (given, world: World = World.getInstance()) => {
    given(
      /^resource owner with email "(.+)" consents to the "(.+)" scope for client "(.+)"$/,
      (email, scope, clientId) => {
        return world
          .useSuperAgentTest(email)
          .post('/user/consent')
          .send({
            scopes: [scope],
            clientId
          });
      }
    );
  };

  const whenAuthorizeRequestMade = (when, world: World = World.getInstance()) => {
    when(
      /^client makes a request to the authorize endpoint with the following parameters for resource owner "(.+)":$/,
      (agentKey: string, table: any[]) => {
        world.superTest = world.useSuperAgentTest(agentKey).get('/authorize').query(table[0]);
      }
    );
  };

  const thenRedirectWithError = (then, world: World = World.getInstance()) => {
    then(/^a redirect is made to "(.+)" with "(.+)" error$/, (redirect_to, error) => {
      const url = new URL(redirect_to);
      url.searchParams.set('error', error);
      return world.superTest.expect(302).expect('Location', url.toString());
    });
  };

  const thenRedirectWithAuthCode = (then, world: World = World.getInstance()) => {
    then(/^a redirect is made to "(.+)" with an auth code$/, (redirect_to) => {
      return new Promise((resolve, reject) => {
        world.superTest.expect(302, (err, res) => {
          if (err) {
            reject('error occurred during request');
          }
          const location: string = res.headers.location;
          const url = new URL(location);
          if (url.origin + url.pathname !== redirect_to) {
            reject('redirect not made correctly');
          }
          if (!new RegExp('^[A-Za-z0-9-]+$').test(url.searchParams.get('code'))) {
            reject('auth code not generated correctly');
          }
          resolve(res);
        });
      });
    });
  };

  test('Unauthenticated request leads to redirect with error', ({ when, then }) => {
    whenAuthorizeRequestMade(when);
    thenRedirectWithError(then);
  });

  test('Authenticated request leads to redirect with auth code', ({ given, when, then }) => {
    givenResourceOwnerRegisters(given);
    givenResourceOwnerLogsIn(given);
    givenResourceOwnerConsentsTo(given);
    whenAuthorizeRequestMade(when);
    thenRedirectWithAuthCode(then);
  });
});
