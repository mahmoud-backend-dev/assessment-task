import { Injectable } from '@nestjs/common';
import { FileValidationUtil } from './providers/file-validation.utility';
import {
  localUploaderProvider,
  UploadResult,
} from './providers/local/local-uploader.provider';
import { FoldersType } from './types/folder-types';

@Injectable()
export class UploadsService {
  constructor(private readonly localUploaderProvider: localUploaderProvider) {}

  /**
   * Saves a file buffer to the specified directory and returns upload details.
   * @param file Express.Multer.File
   * @param folder string (relative to project root)
   * @returns UploadResult
   */
  public uploadFileLocally(
    file: Express.Multer.File,
    folder: FoldersType
  ): UploadResult {
    console.log(file.mimetype);

    //validateFile
    FileValidationUtil.validateFile(file);

    //upload the file to aws s3 bucket
    const result = this.localUploaderProvider.uploadFileLocally(file, folder);

    return result;
  }

  /**
   * Unlinks (deletes) a file from the specified relative path.
   * @param filePath string (relative file path)
   */
  public unlinkFileLocally(filePath: string): void {
    return this.localUploaderProvider.unlinkFileLocally(filePath);
  }
}
