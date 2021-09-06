import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Prompt } from '../../src/authorize/prompt.enum';
import { World } from './shared/world';

interface AuthorizeParams {
  response_type: ResponseType;
  client_id: string;
  redirect_uri: string;
  scope?: string;
  prompt?: Prompt;
}

const feature = loadFeature('test/features/authorize.feature');

defineFeature(feature, (test) => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    World.getInstance().app = await app.init();
  });

  afterAll(() => {
    app.get(DynamoDBClient).destroy(); //dynalite hangs if you don't do this
  });

  const whenARequestIsMadeToGetAuthTokenWithParams = (when, world: World = World.getInstance()) => {
    when(
      'a request to get an auth token is made with the following parameters:',
      (table: AuthorizeParams[]) => {
        const params: AuthorizeParams = table[0];
        world.request = request(world.app.getHttpServer()).get('/authorize').query(params);
      }
    );
  };

  const thenARedirectIsMadeToTheSpecifiedURIWithAuthTOken = (
    then,
    world: World = World.getInstance()
  ) => {
    then(/^a redirect is made to "(.+)"$/, (redirect_uri) => {
      return world.request.expect(302).expect('Location', redirect_uri);
    });
  };

  test('Unauthenticated request leads to redirect with error', ({ when, then }) => {
    whenARequestIsMadeToGetAuthTokenWithParams(when);
    thenARedirectIsMadeToTheSpecifiedURIWithAuthTOken(then);
  });
});
