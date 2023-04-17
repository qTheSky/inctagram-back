import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class TrollMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    throw new ForbiddenException('You have to pay 10000 rub to use this api');
  }
}
