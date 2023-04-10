import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { useContainer } from 'class-validator';

export const containerSetup = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};
