import { ConfigService } from '@/config/config.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../enums/auth.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  type: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_req, rawToken, done) => {
        try {
          const decoded = jwt.decode(rawToken) as JwtPayload | null;
          if (!decoded || !decoded.type) {
            return done(
              new UnauthorizedException('Invalid token payload'),
              null
            );
          }
          const secret =
            decoded.type === Role.ADMIN
              ? this.configService.jwtAccessTokenSecret
              : this.configService.jwtClientAccessTokenSecret;
          return done(null, secret);
        } catch (error) {
          return done(error as Error, null);
        }
      },
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
    };
  }
}
