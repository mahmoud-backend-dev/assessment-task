import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

//***** Generates a file name ******
export function generateFileName(file: Express.Multer.File) {
  const baseName = file.originalname.split('.')[0]?.replace(/\s/g, '')?.trim();
  const extension = path.extname(file.originalname);
  const uuid = uuidv4();
  return `${uuid}-${baseName}${extension}`;
}

export function extractUuidFromFileName(fileName: string): string | null {
  const uuidRegex =
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-/i;
  const match = fileName.match(uuidRegex);
  return match ? match[1] : null;
}

export function toBoolean({ value }: { value: any }) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return Boolean(value);
}
