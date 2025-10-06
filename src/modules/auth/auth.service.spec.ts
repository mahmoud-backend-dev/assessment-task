import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@/config/config.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { AuthService } from '@/modules/auth/auth.service';
import { Role } from '@/modules/auth/enums/auth.enum';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@/config/config.service';

const mockConfig = {
  jwtAccessTokenSecret: 'admin-secret',
  jwtAccessTokenExpiry: '1h',
  jwtClientAccessTokenSecret: 'client-secret',
  jwtClientAccessTokenExpiry: '1h',
};

class ConfigServiceMock {
  get jwtAccessTokenSecret() {
    return mockConfig.jwtAccessTokenSecret;
  }
  get jwtAccessTokenExpiry() {
    return mockConfig.jwtAccessTokenExpiry;
  }
  get jwtClientAccessTokenSecret() {
    return mockConfig.jwtClientAccessTokenSecret;
  }
  get jwtClientAccessTokenExpiry() {
    return mockConfig.jwtClientAccessTokenExpiry;
  }
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [AuthService, { provide: ConfigService, useClass: ConfigServiceMock }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('signs and verifies ADMIN token', async () => {
    const payload = { sub: 'admin-1' };
    const token = await service.signAccessToken(payload, Role.ADMIN);

    const decoded = await service.verifyToken(token, Role.ADMIN);
    expect(decoded.sub).toBe('admin-1');
  });

  it('signs and verifies CUSTOMER token', async () => {
    const payload = { sub: 'customer-1' };
    const token = await service.signAccessToken(payload, Role.CUSTOMER);

    const decoded = await service.verifyToken(token, Role.CUSTOMER);
    expect(decoded.sub).toBe('customer-1');
  });

  it('fails to verify with wrong audience secret', async () => {
    const payload = { sub: 'admin-1' };
    const token = await service.signAccessToken(payload, Role.ADMIN);

    await expect(service.verifyToken(token, Role.CUSTOMER)).rejects.toThrow();
  });
});
