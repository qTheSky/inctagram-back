import { AppModule } from '../../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '../../src/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { cleanDb } from './clean-db';

export const getAppAndCleanDB = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      ConfigModule.forRoot(),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: getTypeOrmConfig,
      }),
    ],
  }).compile();
  const app: INestApplication = moduleFixture.createNestApplication();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));
  app.use(cookieParser());

  await cleanDb({ app });

  await app.init();
  return app;
};
