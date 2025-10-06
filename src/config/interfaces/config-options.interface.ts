/**
 * Define configuration options.
 */
export interface ConfigModuleOptions {
  /**
   * Name of the file containing env config.
   * @default .env
  // eslint-disable-next-line prettier/prettier
   * @example .env.development
   */
  filename?: string;

  /**
   * Decide wether to obtain config from use process.env or a file.
   * @default false
   */
  useProcess?: boolean;
}
