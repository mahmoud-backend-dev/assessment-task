import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@/modules/auth/enums/auth.enum';

export interface AuthUser {
  id: string;
  email: string;
  type: Role;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

