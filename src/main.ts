import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import { join } from 'path';
import { AppModule } from './app.module';
import { asyncLocalStorage } from './async-local-storage';
import { DynamoSessionStore } from './authentication/dynamo-session.store';
import { AsyncLocalStorageValue } from './util/async-local-storage.service';

async function bootstrap() {
  await asyncLocalStorage.run(new Map<AsyncLocalStorageValue, any>(), async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const sessionStore = app.get(DynamoSessionStore);
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
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
    await app.listen(3000);
  });
}
bootstrap();
