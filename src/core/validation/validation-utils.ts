import { ResultNotification } from './notification';
import { validateOrReject } from 'class-validator';
import {
  validationErrorsMapper,
  ValidationPipeErrorType,
} from '../../config/pipesSetup';

export class DomainError extends Error {
  constructor(message: string, public resultNotification: ResultNotification) {
    super(message);
  }
}

export const validateEntityOrThrow = async (entity: any) => {
  try {
    await validateOrReject(entity);
  } catch (errors) {
    const resultNotification: ResultNotification = mapErorsToNotification(
      validationErrorsMapper.mapValidationErrorArrayToValidationPipeErrorTypeArray(
        errors
      )
    );

    throw new DomainError('domain entity validation error', resultNotification);
  }
};

export const validateEntity = async <T extends object>(
  entity: T
): Promise<ResultNotification<T>> => {
  try {
    await validateOrReject(entity);
  } catch (errors) {
    const resultNotification: ResultNotification = mapErorsToNotification(
      validationErrorsMapper.mapValidationErrorArrayToValidationPipeErrorTypeArray(
        errors
      )
    );
    return resultNotification;
  }
  return new ResultNotification<T>(entity);
};

export function mapErorsToNotification(errors: ValidationPipeErrorType[]) {
  const resultNotification = new ResultNotification();
  errors.forEach((item: ValidationPipeErrorType) =>
    resultNotification.addError(item.message, item.field, 1)
  );
  return resultNotification;
}
