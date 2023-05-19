import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configApp } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configApp(app);
  await app.listen(process.env.LOCALPORT || 3000);
}
bootstrap().then(() => {
  console.log(
    `BEST BACKEND SERVER IS RUNNING ON PORT ${process.env.LOCALPORT || 3000}`
  );
});
