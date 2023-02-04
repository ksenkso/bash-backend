import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions =
    process.env.NODE_ENV === 'production'
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

  const configService = app.get(ConfigService);
  const APP_PORT = configService.get<number>('APP_PORT');

  await app.listen(APP_PORT);
  console.log(`Listening on port ${APP_PORT}`);
}
bootstrap();
