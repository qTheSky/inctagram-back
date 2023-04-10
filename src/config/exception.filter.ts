import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainError,
  ResultNotification,
  mapErorsToNotification,
} from '../core/validation';

@Catch(DomainError)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    console.log('---ErrorException', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(400).send(exception.resultNotification);
  }
}

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('---HttpException', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      // const resp: any = exception.getResponse();
      // if (resp instanceof ResultNotification) {
      //   response.status(status).json(resp);
      //   return;
      // }
      // const resultNotification = mapErorsToNotification(resp.message);
      // response.status(status).json(resultNotification);

      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();

      responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
