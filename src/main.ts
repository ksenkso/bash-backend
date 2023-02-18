import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as http from 'http';
import * as https from 'https';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const httpsOptions =
    IS_PRODUCTION
      ? {
          key: fs.readFileSync('./cert.key'),
          cert: fs.readFileSync('./cert.crt'),
        }
      : undefined;
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors();

  await app.init();

  if (IS_PRODUCTION) {
    http.createServer(server).listen(80);
    https.createServer(httpsOptions, server).listen(443);
  } else {
    const configService = app.get(ConfigService);
    const APP_PORT = configService.get<number>('APP_PORT');

    http.createServer(server).listen(APP_PORT);
    console.log(`Listening on port ${APP_PORT}`);
  }
}
bootstrap();
