import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@/config/config.service';
import { Role } from '@/modules/auth/enums/auth.enum';

export type TokenAudience = Role;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signAccessToken<T extends Record<string, any>>(
    payload: T,
    audience: TokenAudience
  ): Promise<string> {
    const { secret, expiresIn } = this.resolveSecretConfig(audience);
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async verifyToken<
    T extends Record<string, any> = Record<string, any>
  >(token: string, audience: TokenAudience): Promise<T> {
    const { secret } = this.resolveSecretConfig(audience);
    return this.jwtService.verifyAsync<T>(token, { secret });
  }

  private resolveSecretConfig(audience: TokenAudience) {
    if (audience === Role.ADMIN) {
      return {
        secret: this.configService.jwtAccessTokenSecret,
        expiresIn: this.configService.jwtAccessTokenExpiry,
      };
    }

    return {
      secret: this.configService.jwtClientAccessTokenSecret,
      expiresIn: this.configService.jwtClientAccessTokenExpiry,
    };
  }
}

