import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as fs from 'fs';
import * as express from 'express';
import * as passport from 'passport';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const httpsOptions =
    IS_PRODUCTION
      ? {
          key: fs.readFileSync('./cert.key'),
          cert: fs.readFileSync('./cert.crt'),
        }
      : undefined;
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    credentials: true,
  });
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: IS_PRODUCTION,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    }
  }));
  app.use(passport.initialize())
  app.use(passport.session());

  if (IS_PRODUCTION) {
    const server = express();
    server.all('*', (req, res) => {
      const url = new URL(req.protocol + '://' + req.hostname + req.originalUrl);
      console.log(url);
      url.protocol = 'https';

      res.redirect(url.toString());
    });
    server.listen(80);
    await app.listen(443);
  } else {
    const configService = app.get(ConfigService);
    const APP_PORT = configService.get<number>('APP_PORT');

    await app.listen(APP_PORT);
    console.log(`Listening on port ${APP_PORT}`);
  }
}
bootstrap();
