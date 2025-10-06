import { ConfigService } from '@/config/config.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FoldersType } from '../../types/folder-types';
import { extractUuidFromFileName, generateFileName } from '../../utils';

export interface UploadResult {
  url: string;
  fileName: string;
  uuid: string | null;
  originalName: string;
}

@Injectable()
export class localUploaderProvider {
  private readonly uploadsDir = 'uploads';
  private logger: Logger;
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(localUploaderProvider.name);
  }

  /**
   * Saves a file buffer to the specified directory and returns upload details.
   * @param file Express.Multer.File
   * @param folder string (relative to uploads directory)
   * @returns UploadResult
   */
  public uploadFileLocally(
    file: Express.Multer.File,
    folder: FoldersType
  ): UploadResult {
    try {
      const dir = path.join(process.cwd(), this.uploadsDir, folder);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const fileName = generateFileName(file);
      const filePath = path.join(dir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      // Extract UUID from filename
      const uuid = extractUuidFromFileName(fileName);

      // Get APP_URL from ConfigService
      const appUrl = this.configService.apiUrl;
      console.log(appUrl);

      // Return full URL instead of relative path
      const relativePath = path
        .join(this.uploadsDir, folder, fileName)
        .replace(/\\/g, '/');

      return {
        url: `${appUrl}/${relativePath}`,
        fileName,
        uuid,
        originalName: file.originalname,
      };
    } catch (error) {
      console.error(`Error uploading file to ${folder}:`, error);
      throw new Error('File upload failed');
    }
  }

  /**
   * Unlinks (deletes) a file from the specified relative path.
   * @param filePath string (relative file path)
   */
  public unlinkFileLocally(filePath: string): void {
    try {
      // Get APP_URL from ConfigService
      const appUrl = this.configService.apiUrl;

      // Check if APP_URL is already part of the filePath
      if (filePath.startsWith(appUrl)) {
        // Remove the APP_URL part to get the local path
        filePath = filePath.replace(appUrl, '');
      }

      // Remove leading slash if present
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }

      // Ensure the path starts with uploads/ if it doesn't already
      if (!filePath.startsWith('uploads/')) {
        filePath = path.join(this.uploadsDir, filePath);
      }

      const absolutePath = path.join(process.cwd(), filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log(`File deleted: ${filePath}`);
      } else {
        this.logger.warn(`File not found for deletion: ${filePath}`);
        //throw new NotFoundException(`File not found for deletion: ${filePath}`);
        return;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      console.error(`Error deleting file at ${filePath}:`, error);
      throw new Error(`Failed to delete file: ${filePath}`);
    }
  }
}
