import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
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
import { ApiLangHeader } from '@/core/decorators/api-lang-header.decorator';
import { CurrentUser, AuthUser } from '@/core/decorators/current-user.decorator';
import {
  ModuleName,
  OperationType,
  ResponseMessage,
} from '@/core/decorators/response-message.decorator';
import { APP_VERSION } from '@/core/enums/version.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { Role } from '@/modules/auth/enums/auth.enum';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { ClientService } from './client.service';
import { ClientQueryDto } from './dto/client-query.dto';
import { LoginClientDto } from './dto/login-client.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResource } from './resources/client.resource';

@ApiTags('Clients')
@ApiSecurity('api-key')
@ApiBearerAuth()
@ApiExtraModels(ClientResource)
@ApiLangHeader()
@Controller({ path: 'clients', version: APP_VERSION.V1 })
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register customer account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer registered successfully',
  })
  @ResponseMessage([OperationType.CREATED_SUCCESSFULLY, ModuleName.CUSTOMER])
  register(@Body() dto: RegisterClientDto) {
    return this.clientService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate customer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer logged in successfully',
  })
  @ResponseMessage([OperationType.OPERATION_SUCCESSFUL, ModuleName.CUSTOMER])
  login(@Body() dto: LoginClientDto) {
    return this.clientService.login(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('me')
  @ApiOperation({ summary: 'Get current customer profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer profile retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ONE_SUCCESSFULLY, ModuleName.CUSTOMER])
  me(@CurrentUser() user: AuthUser) {
    return this.clientService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Patch('me')
  @ApiOperation({ summary: 'Update current customer profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer profile updated successfully',
  })
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.CUSTOMER])
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateClientDto) {
    return this.clientService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List customers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customers retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ALL_SUCCESSFULLY, ModuleName.CUSTOMER])
  findAll(@Query() query: ClientQueryDto) {
    return this.clientService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Customer identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ONE_SUCCESSFULLY, ModuleName.CUSTOMER])
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Customer identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer updated successfully',
  })
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.CUSTOMER])
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer by id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Customer identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer deleted successfully',
  })
  @ResponseMessage([OperationType.DELETED_SUCCESSFULLY, ModuleName.CUSTOMER])
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}

