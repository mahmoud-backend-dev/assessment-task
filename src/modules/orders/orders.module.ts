import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { OrdersHelper } from './helpers/order-helper.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersHelper],
  exports: [OrdersService],
})
export class OrdersModule {}
