import { DynamoDBClient, Put, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import { AppModule } from '../../../src/app.module';
import { DynamoSessionStore } from '../../../src/authentication/dynamo-session.store';
import { TransactableWriteService } from '../../../src/util/transactable-write.service';

export async function createApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(TransactableWriteService) //jest-dynalite does not recognize "transactional" commands so I am overriding this provider to work around that
    .useFactory({
      factory: (client) => {
        return {
          putItemsTransactionally: (puts: Put[]) => {
            return Promise.all(
              puts.map((put) => {
                return client.send(new PutItemCommand(put));
              })
            ).then();
          }
        };
      },
      inject: [DynamoDBClient]
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  const sessionStore = app.get(DynamoSessionStore);
  app.use(cookieParser());
  app.use(
    expressSession({
      secret: 'local secret change me',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false
      },
      store: sessionStore
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  return app;
}
