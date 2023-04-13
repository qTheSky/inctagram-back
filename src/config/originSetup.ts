import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const origin = ['http://localhost:3000', 'https://inctagram.online'];

const getCorsOptions = (origin: string[]): CorsOptions => ({
  origin,
  credentials: true,
});

export const corseSetup = (app: INestApplication) => {
  app.enableCors(getCorsOptions(origin));
};
