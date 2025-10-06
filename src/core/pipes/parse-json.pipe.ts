import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

@Injectable()
export class GlobalParseJsonPipe implements PipeTransform {
  private readonly jsonFields = ['filters']; // Fields to parse as JSON
  private readonly validationPipe = new ValidationPipe({ transform: true });

  async transform(value: any, metadata: ArgumentMetadata) {
    // Only process query parameters
    if (metadata.type !== 'query') {
      return value;
    }

    // Create a copy of the value to avoid mutating the original
    const processedValue = { ...value };

    // Parse JSON fields if they exist
    for (const field of this.jsonFields) {
      if (processedValue[field] && typeof processedValue[field] === 'string') {
        try {
          processedValue[field] = JSON.parse(processedValue[field]);
        } catch (error) {
          throw new BadRequestException(`Invalid JSON format in ${field}`);
        }
      }
    }

    // Apply validation pipe to transform and validate the DTO
    return this.validationPipe.transform(processedValue, metadata);
  }
}
