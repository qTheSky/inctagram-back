import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export const cookieParserSetup = (app: INestApplication) => {
  app.use(cookieParser());
};
