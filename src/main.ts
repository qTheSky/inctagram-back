import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configApp } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  configApp(app);

  await app.listen(3000);
}
bootstrap();
