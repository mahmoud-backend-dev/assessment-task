import { ConfigModule } from '@/config/config.module';
import { ResponseModule } from '@/core/custom-response/custom-response.module';
import { Global, Module } from '@nestjs/common';
import { localUploaderProvider } from './providers/local/local-uploader.provider';
import { UploadsService } from './uploader.service';

@Global()
@Module({
  imports: [ResponseModule, ConfigModule.Deferred],
  providers: [UploadsService, localUploaderProvider],
  exports: [UploadsService],
})
export class UploaderModule {}
