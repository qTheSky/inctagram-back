import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../core/validation';

@Catch(DomainError)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(400).send(exception.resultNotification);
  }
}

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        message: exception.message,
      });
    }
  }
}
