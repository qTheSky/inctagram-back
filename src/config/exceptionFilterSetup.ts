import { INestApplication } from '@nestjs/common';
import { ExceptionsFilter } from './exception.filter';

export const exceptionFilterSetup = (app: INestApplication) => {
  app.useGlobalFilters(new ExceptionsFilter());
};
