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
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { ProductResource } from './resources/product.resource';

@ApiTags('Products')
@ApiSecurity('api-key')
@ApiBearerAuth()
@ApiExtraModels(ProductResource)
@ApiLangHeader()
@Controller({ path: 'products', version: APP_VERSION.V1 })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
  })
  @ResponseMessage([OperationType.CREATED_SUCCESSFULLY, ModuleName.PRODUCT])
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ALL_SUCCESSFULLY, ModuleName.PRODUCT])
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @Get('recommendations/:userId')
  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'Customer identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recommendations generated successfully',
  })
  @ResponseMessage([OperationType.GET_ALL_SUCCESSFULLY, ModuleName.PRODUCT])
  recommendations(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.productsService.getRecommendations(user, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
  })
  @ResponseMessage([OperationType.GET_ONE_SUCCESSFULLY, ModuleName.PRODUCT])
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update product by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
  })
  @ResponseMessage([OperationType.UPDATED_SUCCESSFULLY, ModuleName.PRODUCT])
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
  })
  @ResponseMessage([OperationType.DELETED_SUCCESSFULLY, ModuleName.PRODUCT])
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

