import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';

@Injectable()
export class I18nHelperService {
  constructor(private readonly i18n: I18nService) {}

  // Method to create a namespace-specific translator
  createNamespaceTranslator(namespace: string) {
    const lang: string = I18nContext.current()?.lang || 'en';
    return {
      t: (key: string, options: TranslateOptions): string => {
        const fullKey = `${namespace}.${key}`;
        return this.i18n.t(fullKey, { ...options, lang });
      },
      lang,
    };
  }
  translate() {
    const lang: string = I18nContext.current().lang;

    return {
      t: (key: string, options?: TranslateOptions): string => {
        return this.i18n.t(key, { ...options, lang });
      },
      lang,
    };
  }

  // Keep the regular t method for cases where you want to use the full path
  t(key: string, options: TranslateOptions = {}): string {
    const lang = I18nContext.current().lang;
    return this.i18n.t(key, { ...options, lang });
  }
}
