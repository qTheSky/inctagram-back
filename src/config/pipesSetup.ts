import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const validationErrorsMapper = {
  mapValidationErrorArrayToValidationPipeErrorTypeArray(
    errors: ValidationError[]
  ): ValidationPipeErrorType[] {
    return errors.flatMap((error) =>
      Object.entries(error.constraints).map(([key, value]) => ({
        field: error.property,
        message: value,
      }))
    );
  },
};

export const pipesSetup = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,

      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const err =
          validationErrorsMapper.mapValidationErrorArrayToValidationPipeErrorTypeArray(
            errors
          );
        throw new BadRequestException(err);
      },
    })
  );
};

export type ValidationPipeErrorType = {
  field: string;
  message: string;
};

// Old pipes

// app.useGlobalPipes(
//   new ValidationPipe({
//     whitelist: true, //forbid extra fields in body
//     transform: true,
//     forbidUnknownValues: false,
//     stopAtFirstError: true,
//     exceptionFactory: (errors) => {
//       const errorsForResponse = [];

//       errors.forEach((e) => {
//         const constraintsKeys = Object.keys(e.constraints);
//         constraintsKeys.forEach((ckey) => {
//           errorsForResponse.push({
//             message: e.constraints[ckey],
//             field: e.property,
//           });
//         });
//       });
//       throw new BadRequestException(errorsForResponse);
//     },
//   })
// );
