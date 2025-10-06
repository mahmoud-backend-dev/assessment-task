import { ApiLangHeader } from '@/core/decorators/api-lang-header.decorator';
import {
  ModuleName,
  OperationType,
  ResponseMessage,
} from '@/core/decorators/response-message.decorator';
import {
  createEmptyResponseSchema,
  createPaginatedResponseSchema,
  createSingleResponseSchema,
} from '@/core/swagger/schema-helpers';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import {
  AuthUser,
  CurrentUser,
} from '@/core/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { Role } from '@/modules/auth/enums/auth.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

import { APP_VERSION } from '@/core/enums/version.enum';
import { AdminService } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResource } from './resources/admin.resource';

@ApiTags('Admins')
@ApiBearerAuth()
@ApiSecurity('api-key')
@ApiLangHeader()
@ApiExtraModels(AdminResource)
@Controller({ path: 'admin', version: APP_VERSION.V1 })
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ResponseMessage([OperationType.CREATED_SUCCESSFULLY, ModuleName.ADMIN])
  @Post('register')
  @ApiOperation({ summary: 'Register admin' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin created successfully',
    schema: createSingleResponseSchema(
      AdminResource,
      'Admin created successfully'
    ),
  })
  register(@Body() dto: CreateAdminDto) {
    return this.adminService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin logged in successfully',
    schema: createSingleResponseSchema(
      AdminResource,
      'Admin logged in successfully'
    ),
  })
  login(@Body() dto: LoginAdminDto) {
    return this.adminService.login(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage([OperationType.GET_ONE_SUCCESSFULLY, ModuleName.ADMIN])
  @Get('me')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin profile retrieved successfully',
    schema: createSingleResponseSchema(
      AdminResource,
      'Admin profile retrieved successfully'
    ),
  })
  me(@CurrentUser() user: AuthUser) {
    return this.adminService.findOne(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.ADMIN])
  @Patch('me')
  @ApiOperation({ summary: 'Update current admin profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin profile updated successfully',
    schema: createSingleResponseSchema(
      AdminResource,
      'Admin profile updated successfully'
    ),
  })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateAdminDto) {
    return this.adminService.update(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage([OperationType.GET_ALL_SUCCESSFULLY, ModuleName.ADMIN])
  @Get()
  @ApiOperation({ summary: 'List admins' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admins retrieved successfully',
    schema: createPaginatedResponseSchema(
      AdminResource,
      'Admins retrieved successfully'
    ),
  })
  findAll(@Query() query: AdminQueryDto) {
    return this.adminService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage([OperationType.GET_ONE_SUCCESSFULLY, ModuleName.ADMIN])
  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Admin ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin retrieved successfully',
    schema: createSingleResponseSchema(
      AdminResource,
      'Admin retrieved successfully'
    ),
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.ADMIN])
  @Patch(':id')
  @ApiOperation({ summary: 'Update admin by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Admin ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin updated successfully',
    schema: createSingleResponseSchema(
      AdminResource,
      'Admin updated successfully'
    ),
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAdminDto
  ) {
    return this.adminService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ResponseMessage([OperationType.DELETED_SUCCESSFULLY, ModuleName.ADMIN])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete admin by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Admin ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin deleted successfully',
    schema: createEmptyResponseSchema('Admin deleted successfully'),
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.remove(id);
  }
}
