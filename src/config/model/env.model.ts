import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Define the available environments for the project.
 */
export enum Environment {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

/**
 * Ogma's eight different logging levels.
 */
enum OgmaLogLevel {
  /** No logs are displayed through Ogma. console.log will still work */
  OFF = 'OFF',
  /** For when you just want to type fun stuff but don't really want people to see it (usually). Colored with Magenta */
  SILLY = 'SILLY',
  /** great for long strings of errors and things going on. Colored with Green */
  VERBOSE = 'VERBOSE',
  /** Just like the name implies, debugging! Colored with Blue */
  DEBUG = 'DEBUG',
  /** For normal logging, nothing special here. Colored with Cyan. */
  INFO = 'INFO',
  /** For errors about things that may be a problem. Colored with Yellow. */
  WARN = 'WARN',
  /** For errors about things that are a problem. Colored with Red. */
  ERROR = 'ERROR',
  /** Yeah, you should call someone at 3AM if this log ever shows up. Colored with Red. */
  FATAL = 'FATAL',
}

/**
 * Define and validate all env variables.
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV = Environment.Development;

  @IsString()
  APP_NAME = 'app';

  @IsEnum(OgmaLogLevel)
  LOG_LEVEL: OgmaLogLevel = OgmaLogLevel.INFO;

  @IsNumber()
  PORT: number = 5100;

  @IsNumber()
  RATE_LIMIT: number = 60;

  @IsString()
  GLOBAL_PREFIX: string = 'api';

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  API_URL: string;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET = '!hard-to-guess-secret';

  @IsString()
  JWT_CLIENT_ACCESS_TOKEN_SECRET = '!client-secret-placeholder';

  @IsString()
  JWT_CLIENT_ACCESS_TOKEN_EXPIRES_IN = '30d';

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRY = '90d';

  @IsBoolean()
  DB_SYNCHRONIZE: boolean = false;

  @IsBoolean()
  DB_LOGGING: boolean = false;

  @IsBoolean()
  DB_AUTO_LOAD_ENTITIES: boolean = false;

  @IsBoolean()
  DB_AUTO_RUN_MIGRATIONS: boolean = false;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;
}
