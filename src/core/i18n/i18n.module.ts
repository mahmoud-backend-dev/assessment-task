import { Global, Module } from '@nestjs/common';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { I18nHelperService } from './providers/I18n-helper-service';

/**
 * the I18nModule itself is global, and we can use its I18nService everywhere without importing
 * the module, but now we are creating our custom LocalizationModule, so we need to define it as
 * a global module explicitly to use the custom I18nHelperService everywhere also
 */
@Global()
@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'dist/core/i18n'),
        includeSubfolders: true,
        watch: true,
      },
      resolvers: [new HeaderResolver(['lang'])],
    }),
  ],
  providers: [I18nHelperService],
  exports: [I18nHelperService],
})
export class LocalizationModule {}
