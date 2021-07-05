import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseType } from '../src/authorize/response-type.enum';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('valid GET /authorize for auth code', () => {
    let scope: string;
    let clientId: string;
    let redirectUri: string;
    let responseType: ResponseType;
    beforeEach(() => {
      responseType = ResponseType.CODE;
      clientId = '1234-5678';
      redirectUri = 'https://youtube.com';
      scope = 'profile openid';
    });

    test('responds successfully', () => {
      return request(app.getHttpServer())
        .get('/authorize')
        .query({
          response_type: responseType,
          client_id: clientId,
          redirect_uri: redirectUri,
          scope
        })
        .expect(200);
    });
  });
});
