import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);

  const mode = config.get('MODE') || 'dev';
  const port = config.get('PORT') || 3000;
  let apiHost = `${config.get('HOST')}`;

  if (mode !== 'prod') {
    apiHost = `${config.get('HOST') || 'localhost'}:${port}`;
  }

  app.enableCors({ origin: ['http://localhost:4200'] });

  await app.listen(port, () => {
    Logger.log(`Running in ${mode} mode`, 'NestApplication');
    Logger.log(`Listening at ${apiHost}`, 'NestApplication');
  });
}

bootstrap();
