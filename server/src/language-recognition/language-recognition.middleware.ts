import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthorizationUserData } from './models';
import * as jwt from 'jsonwebtoken';

export interface AuthorizationRequest extends Request {
  user: AuthorizationUserData;
}

@Injectable()
export class LanguageRecognitionMiddleware implements NestMiddleware {
  use(req: AuthorizationRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decodedToken: any = jwt.verify(token, process.env.SECRET);
        req.user = {
          id: decodedToken.id,
          email: decodedToken.email,
        };
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

    next();
  }
}
