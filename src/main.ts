import { startTracing } from './tracing'; //must be 1st import
startTracing(); //must run before other imports
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as passport from 'passport';
import { join } from 'path';
import { AppModule } from './app.module';
import { DynamoSessionStore } from './authentication/dynamo-session.store';

async function bootstrap() {
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
}
bootstrap();
