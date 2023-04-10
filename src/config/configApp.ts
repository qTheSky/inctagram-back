import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swaggerSetup';
import { pipesSetup } from './pipesSetup';
import { exceptionFilterSetup } from './exceptionFilterSetup';
import { corseSetup } from './originSetup';
import { cookieParserSetup } from './cookieParserSetup';

export function configApp(app: INestApplication) {
  pipesSetup(app);
  swaggerSetup(app);
  exceptionFilterSetup(app);
  corseSetup(app);
  cookieParserSetup(app);
}
