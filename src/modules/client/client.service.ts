import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ResponseService } from '@/core/custom-response/custom-response.service';
import { I18nHelperService } from '@/core/i18n/providers/I18n-helper-service';
import { AuthService } from '@/modules/auth/auth.service';
import { Role } from '@/modules/auth/enums/auth.enum';
import { PrismaService } from '@/prisma/prisma.service';
import { ClientQueryDto } from './dto/client-query.dto';
import { LoginClientDto } from './dto/login-client.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResource } from './resources/client.resource';

@Injectable()
export class ClientService {
  private readonly t: (key: string, options?: any) => string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly response: ResponseService,
    private readonly i18nHelper: I18nHelperService
  ) {
    const { t } = this.i18nHelper.createNamespaceTranslator('client');
    this.t = t;
  }

  async register(dto: RegisterClientDto) {
    await this.ensureEmailIsUnique(dto.email);

    const password = await this.hashPassword(dto.password);
    const client = await this.prisma.user.create({
      data: {
        ...dto,
        password,
        type: UserType.CUSTOMER,
      },
    });

    const token = await this.authService.signAccessToken(
      { sub: client.id, type: UserType.CUSTOMER, email: client.email },
      Role.CUSTOMER
    );

    return this.response.created({
      message: this.t('ACCOUNT_CREATED_SUCCESSFULLY'),
      data: {
        accessToken: token,
        customer: ClientResource.fromModel(client),
      },
    });
  }

  async login(dto: LoginClientDto) {
    const customer = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        type: UserType.CUSTOMER,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException(this.t('CUSTOMER_NOT_FOUND'));
    }

    const isValid = await bcrypt.compare(dto.password, customer.password);
    if (!isValid) {
      throw new UnauthorizedException(this.t('INVALID_CUSTOMER_CREDENTIALS'));
    }

    await this.prisma.user.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.authService.signAccessToken(
      { sub: customer.id, type: UserType.CUSTOMER, email: customer.email },
      Role.CUSTOMER
    );

    return this.response.success({
      message: this.t('LOGIN_SUCCESSFUL'),
      data: {
        accessToken: token,
        customer: ClientResource.fromModel(customer),
      },
    });
  }

  async getProfile(id: string) {
    const customer = await this.getCustomerOrFail(id);
    return this.response.success({
      message: this.t('PROFILE_RETRIEVED_SUCCESSFULLY'),
      data: ClientResource.fromModel(customer),
    });
  }

  async updateProfile(id: string, dto: UpdateClientDto) {
    const sanitized: UpdateClientDto = { ...dto };
    delete sanitized.isActive;
    return this.update(id, sanitized);
  }

  async findAll(query: ClientQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const where: Prisma.UserWhereInput = {
      type: UserType.CUSTOMER,
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
      message: this.t('CUSTOMERS_RETRIEVED_SUCCESSFULLY'),
      data: {
        items: ClientResource.collection(items),
        meta,
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.getCustomerOrFail(id);
    return this.response.success({
      message: this.t('CUSTOMER_RETRIEVED_SUCCESSFULLY'),
      data: ClientResource.fromModel(customer),
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    const customer = await this.getCustomerOrFail(id);

    if (dto.email && dto.email !== customer.email) {
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
      message: this.t('CUSTOMER_UPDATED_SUCCESSFULLY'),
      data: ClientResource.fromModel(updated),
    });
  }

  async remove(id: string) {
    await this.getCustomerOrFail(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return this.response.success({
      message: this.t('CUSTOMER_REMOVED_SUCCESSFULLY'),
    });
  }

  private async getCustomerOrFail(id: string) {
    const customer = await this.prisma.user.findFirst({
      where: {
        id,
        type: UserType.CUSTOMER,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException(this.t('CUSTOMER_NOT_FOUND'));
    }

    return customer;
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
      throw new BadRequestException(this.t('EMAIL_ALREADY_IN_USE'));
    }
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
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

