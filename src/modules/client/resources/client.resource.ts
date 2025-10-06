import { User } from '@prisma/client';

export type ClientResponse = {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class ClientResource {
  static fromModel(user: User): ClientResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static collection(users: User[]): ClientResponse[] {
    return users.map(ClientResource.fromModel);
  }
}
