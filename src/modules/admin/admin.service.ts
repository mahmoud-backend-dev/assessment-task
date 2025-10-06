import { ResponseService } from '@/core/custom-response/custom-response.service';
import { AuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Role } from '../auth/enums/auth.enum';
import { AdminQueryDto } from './dto/admin-query.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResource } from './resources/admin.resource';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly response: ResponseService
  ) {}

  async register(dto: CreateAdminDto) {
    await this.ensureEmailIsUnique(dto.email);

    const password = await this.hashPassword(dto.password);
    const admin = await this.prisma.user.create({
      data: {
        ...dto,
        password,
        type: UserType.ADMIN,
      },
    });

    return this.response.created({
      message: 'Admin created successfully',
      data: AdminResource.fromModel(admin),
    });
  }

  async login(dto: LoginAdminDto) {
    const admin = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        type: UserType.ADMIN,
        deletedAt: null,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin account not found');
    }

    const isValid = await bcrypt.compare(dto.password, admin.password);
    if (!isValid) {
      throw new BadRequestException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = await this.authService.signAccessToken(
      { sub: admin.id, type: UserType.ADMIN, email: admin.email },
      Role.ADMIN
    );

    return this.response.success({
      message: 'Login successful',
      data: {
        accessToken,
        admin: AdminResource.fromModel(admin),
      },
    });
  }

  async findAll(query: AdminQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const where: Prisma.UserWhereInput = {
      type: UserType.ADMIN,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const meta = this.buildPaginationMeta(page, limit, total);

    return this.response.success({
      data: {
        items: AdminResource.collection(items),
        meta,
      },
    });
  }

  async findOne(id: string) {
    const admin = await this.getAdminOrFail(id);
    return this.response.success({ data: AdminResource.fromModel(admin) });
  }

  async update(id: string, dto: UpdateAdminDto) {
    const admin = await this.getAdminOrFail(id);

    if (dto.email && dto.email !== admin.email) {
      await this.ensureEmailIsUnique(dto.email, id);
    }

    const data: Prisma.UserUpdateInput = {
      ...this.removeUndefined({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        isActive: dto.isActive,
      }),
    };

    if (dto.password) {
      data.password = await this.hashPassword(dto.password);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.response.success({
      message: 'Admin updated successfully',
      data: AdminResource.fromModel(updated),
    });
  }

  async remove(id: string) {
    await this.getAdminOrFail(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return this.response.success({ message: 'Admin deleted successfully' });
  }

  private async ensureEmailIsUnique(email: string, excludeId?: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private async getAdminOrFail(id: string) {
    const admin = await this.prisma.user.findFirst({
      where: {
        id,
        type: UserType.ADMIN,
        deletedAt: null,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  private buildPaginationMeta(page: number, limit: number, totalItems: number) {
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      totalItems,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      limit,
    };
  }

  private removeUndefined<T extends Record<string, any>>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([, value]) => value !== undefined)
    ) as T;
  }
}
