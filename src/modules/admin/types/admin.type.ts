export type AdminResponse = {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  lastLoginAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
