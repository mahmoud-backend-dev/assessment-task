import { BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  required?: boolean;
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  maxFiles?: number;
  minFiles?: number;
}

export const DEFAULT_FILE_VALIDATION_OPTIONS: FileValidationOptions = {
  required: true,
  maxSize: 15 * 1024 * 1024, // 15MB
  allowedMimeTypes: [
    // Images
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/x-ms-wmv', // .wmv
    'video/webm',
    'video/ogg',
    // Documents
    'application/pdf',
  ],
  maxFiles: 10,
  minFiles: 1,
};

export class FileValidationUtil {
  /**
   * Validates a single file against the provided options
   * @param file The file to validate
   * @param options Validation options
   */
  static validateFile(
    file: Express.Multer.File | undefined,
    options: FileValidationOptions = DEFAULT_FILE_VALIDATION_OPTIONS
  ): void {
    const mergedOptions = { ...DEFAULT_FILE_VALIDATION_OPTIONS, ...options };

    // Check if file is required but not provided
    if (mergedOptions.required && !file) {
      throw new BadRequestException('File is required');
    }

    // If file is not required and not provided, skip validation
    if (!file) {
      return;
    }

    if (Array.isArray(file)) {
      throw new BadRequestException('only single file is allowed');
    }

    // Validate file size
    if (file.size > mergedOptions.maxSize) {
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${mergedOptions.maxSize / (1024 * 1024)}MB`
      );
    }

    // Validate MIME type
    if (
      mergedOptions.allowedMimeTypes &&
      mergedOptions.allowedMimeTypes.length > 0 &&
      !mergedOptions.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${mergedOptions.allowedMimeTypes.join(', ')}`
      );
    }
  }

  /**
   * Validates multiple files against the provided options
   * @param files The files to validate
   * @param options Validation options
   */
  static validateFiles(
    files: Express.Multer.File[] | undefined,
    options: FileValidationOptions = DEFAULT_FILE_VALIDATION_OPTIONS
  ): void {
    const mergedOptions = { ...DEFAULT_FILE_VALIDATION_OPTIONS, ...options };

    // Check if files are required but not provided
    if (mergedOptions.required && (!files || files.length === 0)) {
      throw new BadRequestException('At least one file is required');
    }

    // If files are not required and not provided, skip validation
    if (!files || files.length === 0) {
      return;
    }

    // Validate number of files
    if (mergedOptions.maxFiles && files.length > mergedOptions.maxFiles) {
      throw new BadRequestException(
        `Maximum number of files allowed is ${mergedOptions.maxFiles}`
      );
    }

    if (mergedOptions.minFiles && files.length < mergedOptions.minFiles) {
      throw new BadRequestException(
        `Minimum number of files required is ${mergedOptions.minFiles}`
      );
    }

    // Validate each file
    files.forEach((file, index) => {
      try {
        this.validateFile(file, options);
      } catch (error) {
        throw new BadRequestException(
          `File at index ${index}: ${error.message}`
        );
      }
    });
  }
}
