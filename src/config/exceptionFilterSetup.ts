import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  ErrorExceptionFilter,
  ValidationExceptionFilter,
} from './exception.filter';

export const exceptionFilterSetup = (app: INestApplication) => {
  app.useGlobalFilters(
    new ErrorExceptionFilter(),
    new ValidationExceptionFilter()
  );
};
