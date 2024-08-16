import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rawBody from 'raw-body';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers['stripe-signature']) {
      rawBody(req, {
        encoding: 'utf8',
      })
        .then((buf) => {
          req['rawBody'] = buf;
          console.log('Request parameters:', buf);
          next();
        })
        .catch((err) => next(err));
    } else {
      next();
    }
  }
}
