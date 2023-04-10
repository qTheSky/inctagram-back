import { INestApplication } from '@nestjs/common';
import { TrimStrings } from '../modules/shared/interceptors/trim-strings-in-body/TrimStrings';

export const interceptorSetup = (app: INestApplication) => {
  app.useGlobalInterceptors(new TrimStrings());
};
