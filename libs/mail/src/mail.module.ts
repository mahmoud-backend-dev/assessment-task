import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailModuleOptions } from './interfaces/mail-options.interface';
import { MAIL_MODULE_OPTIONS } from './mail.constants';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule extends createConfigurableDynamicRootModule<MailModule, MailModuleOptions>(
  MAIL_MODULE_OPTIONS,
) {
  static Deferred = MailModule.externallyConfigured(MailModule, 0);
}
