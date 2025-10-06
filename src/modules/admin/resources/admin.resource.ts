import { User } from '@prisma/client';
import { AdminResponse } from '../types/admin.type';

export class AdminResource {
  static fromModel(user: User): AdminResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static collection(users: User[]): AdminResponse[] {
    return users.map(AdminResource.fromModel);
  }
}
