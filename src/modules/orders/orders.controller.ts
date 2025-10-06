import {
  Body,
  Controller,
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
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
import { OrderResource } from './resources/order.resource';

@ApiTags('Orders')
@ApiSecurity('api-key')
@ApiBearerAuth()
@ApiExtraModels(OrderResource)
@ApiLangHeader()
@Controller({ path: 'orders', version: APP_VERSION.V1 })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post()
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
  })
  @ResponseMessage([OperationType.CREATED_SUCCESSFULLY, ModuleName.ORDER])
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ALL_SUCCESSFULLY, ModuleName.ORDER])
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Get('mine')
  @ApiOperation({ summary: 'List current customer orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer orders retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ALL_SUCCESSFULLY, ModuleName.ORDER])
  findMine(@CurrentUser() user: AuthUser, @Query() query: OrderQueryDto) {
    return this.ordersService.findCustomerOrders(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ONE_SUCCESSFULLY, ModuleName.ORDER])
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.findOneForUser(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated successfully',
  })
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.ORDER])
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiParam({ name: 'id', type: 'string', description: 'Order identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order cancelled successfully',
  })
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.ORDER])
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CancelOrderDto
  ) {
    return this.ordersService.cancel(id, user.id, dto);
  }
}

