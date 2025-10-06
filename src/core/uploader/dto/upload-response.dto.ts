import { ApiProperty } from '@nestjs/swagger';

export class SingleFileUploadResponseDto {
  @ApiProperty({
    description: 'Uploaded file path/URL',
    example: 'http://localhost:3000/uploads/page-sections/image-123456.jpg',
  })
  filePath: string;
}

export class MultipleFileUploadResponseDto {
  @ApiProperty({
    description: 'Array of uploaded file paths/URLs',
    type: [String],
    example: [
      'http://localhost:3000/uploads/page-sections/image-1.jpg',
      'http://localhost:3000/uploads/page-sections/image-2.jpg',
    ],
  })
  filePaths: string[];
}
