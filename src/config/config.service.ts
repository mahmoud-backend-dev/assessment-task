import { Inject, Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CONFIG_MODULE_OPTIONS } from './config.constants';
import { ConfigModuleOptions } from './interfaces/config-options.interface';
import { EnvironmentVariables } from './model/env.model';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private envConfig: EnvironmentVariables;

  constructor(@Inject(CONFIG_MODULE_OPTIONS) options: ConfigModuleOptions) {
    // Check that a config file is provided or using process.env is set to true
    if (!options.useProcess && !options.filename) {
      throw new Error(
        'Missing configuration options. If using process.env variables, please set useProcess to "true". Otherwise, provide a valid env file.'
      );
    }

    const config = this.loadConfig(options);
    this.envConfig = this.validateConfig(config);
  }

  /**
   * Loads configuration from a file or process.env.
   * @param {ConfigModuleOptions} options
   * @returns {Record<string, any>}
   */
  private loadConfig(options: ConfigModuleOptions): Record<string, any> {
    if (
      (!options.useProcess && options.filename) ||
      (options.useProcess && process.env.NODE_ENV !== 'production')
    ) {
      try {
        // Read config from a file
        return parse(
          readFileSync(join(process.env.PWD || process.cwd(), options.filename))
        );
      } catch (error) {
        this.logger.error('Error reading configuration file:', error);
        throw new Error(`Failed to read configuration file: ${error.message}`);
      }
    }
    // Read config from process.env
    return process.env;
  }

  /**
   * Validates and transforms configs.
   * @param {Record<string, any>} config
   * @returns {EnvironmentVariables}
   */
  private validateConfig(config: Record<string, any>): EnvironmentVariables {
    // Convert plain config to class
    const validatedConfig = plainToClass(EnvironmentVariables, config, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });

    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => Object.values(err.constraints || {}))
        .join(', ');
      throw new Error(`Configuration validation error: ${errorMessages}`);
    }

    return validatedConfig;
  }

  get appName(): string {
    return this.envConfig.APP_NAME;
  }

  get logLevel(): any {
    return this.envConfig.LOG_LEVEL;
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get isProd(): boolean {
    return this.nodeEnv.toLowerCase() === 'production';
  }

  /**
   * CORS (Cross-Origin Resource Sharing) config.
   */
  get cors(): string | string[] | RegExp[] {
    const { NODE_ENV, CORS_ORIGINS } = this.envConfig;

    switch (NODE_ENV) {
      case 'production':
      case 'staging':
        return CORS_ORIGINS?.split(',').map(origin => origin.trim()) ?? [];

      case 'test':
        return [/localhost/];

      case 'development':
      default:
        return '*';
    }
  }

  get globalPrefix(): string {
    return this.envConfig.GLOBAL_PREFIX;
  }

  get port(): number {
    return this.envConfig.PORT;
  }

  get rateLimit(): number {
    return this.envConfig.RATE_LIMIT;
  }

  get apiUrl(): string {
    return this.envConfig.API_URL;
  }

  get jwtAccessTokenSecret(): string {
    return this.envConfig.JWT_ACCESS_TOKEN_SECRET;
  }

  get jwtAccessTokenExpiry(): string {
    return this.envConfig.JWT_ACCESS_TOKEN_EXPIRY;
  }

  get jwtRefreshTokenSecret(): string {
    return this.envConfig.JWT_ACCESS_TOKEN_SECRET;
  }


  get jwtClientAccessTokenSecret(): string {
    return this.envConfig.JWT_CLIENT_ACCESS_TOKEN_SECRET;
  }

  get jwtClientAccessTokenExpiry(): string {
    return this.envConfig.JWT_CLIENT_ACCESS_TOKEN_EXPIRES_IN;
  }



  get jwtRefreshTokenExpiry(): string {
    return this.envConfig.JWT_ACCESS_TOKEN_EXPIRY;
  }

  get dbHost(): string {
    return this.envConfig.DB_HOST;
  }

  get dbPort(): number {
    return this.envConfig.DB_PORT;
  }

  get dbUser(): string {
    return this.envConfig.DB_USER;
  }

  get dbPassword(): string {
    return this.envConfig.DB_PASSWORD;
  }

  get dbName(): string {
    return this.envConfig.DB_NAME;
  }

  get dbSynchronize(): boolean {
    return this.envConfig.DB_SYNCHRONIZE ?? false;
  }

  get dbLogging(): boolean {
    return this.envConfig.DB_LOGGING ?? false;
  }

  get dbAutoLoadEntities(): boolean {
    return this.envConfig.DB_AUTO_LOAD_ENTITIES ?? false;
  }

  get dbAutoRunMigrations(): boolean {
    return this.envConfig.DB_AUTO_RUN_MIGRATIONS ?? false;
  }
}
