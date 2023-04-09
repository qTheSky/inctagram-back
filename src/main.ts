import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { TrimStrings } from './modules/shared/interceptors/trim-strings-in-body/TrimStrings';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './modules/shared/filters/exception.filter';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalInterceptors(new TrimStrings());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: false,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];

        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints);
          constraintsKeys.forEach((ckey) => {
            errorsForResponse.push({
              message: e.constraints[ckey],
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    })
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());

  //swagger
  const config = new DocumentBuilder()
    .setTitle('INCTAGRAM API')
    .setDescription('here will be some description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  //swagger

  await app.listen(3000);
}
bootstrap();
