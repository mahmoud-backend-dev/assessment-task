import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const lang = req.headers['lang'];
    req['lang'] = lang && (lang === 'ar' || lang === 'en') ? lang : 'en';
    next();
  }
}
