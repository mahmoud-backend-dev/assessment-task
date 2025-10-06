import { ModuleConfigFactory } from '@golevelup/nestjs-modules';
import { Injectable } from '@nestjs/common';
import { ConfigModuleOptions } from '../interfaces/config-options.interface';
import { Environment } from '../model/env.model';

@Injectable()
export class ConfigModuleConfig implements ModuleConfigFactory<ConfigModuleOptions> {
  createModuleConfig(): ConfigModuleOptions {
    const rawEnv = process.env.NODE_ENV?.toLowerCase();
    const validEnv = Object.values(Environment).includes(rawEnv as Environment)
      ? (rawEnv as Environment)
      : Environment.Development;

    return {
      filename: `.env.${validEnv}`,
      useProcess: false,
    };
  }
}
