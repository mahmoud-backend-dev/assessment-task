import { TranslateOptions } from "nestjs-i18n";

export type TFunction = (key: string, options?: TranslateOptions) => string;
