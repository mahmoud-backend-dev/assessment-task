import { LocalizationModule } from '@/core/i18n/i18n.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ConfigModuleConfig } from './config/options';
import { CoreModule } from './core/core.module';
import { ApiKeyMiddleware } from './core/middlewares/api-key.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRootAsync(ConfigModule, { useClass: ConfigModuleConfig }),
    PrismaModule,
    AuthModule,
    CoreModule,
    LocalizationModule,
    AdminModule,
    ClientModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
