import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as express from 'express';

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
  app.enableCors();

  await app.init();

  if (IS_PRODUCTION) {
    const server = express();
    server.all('*', (req, res) => {
      const url = new URL(req.baseUrl, req.hostname)
      url.protocol = 'https';
      console.log(url.toString());

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
