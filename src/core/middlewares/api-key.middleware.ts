import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['X-Access-Api'] || req.headers['x-access-api'];
    if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
      console.log(`env variable = ${process.env.API_SECRET_KEY}`);
      console.log('request api key', apiKey);
      throw new UnauthorizedException('INVALID_API_KEY');
    }
    next();
  }
}
