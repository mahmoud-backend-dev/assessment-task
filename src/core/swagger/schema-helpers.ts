import { Type } from '@nestjs/common';
import { getSchemaPath } from '@nestjs/swagger';

export function createPaginatedResponseSchema<T>(
  itemType: Type<T>,
  message: string = 'Request successful'
) {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: message },
      data: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(itemType) },
            description: 'Array of items',
          },
          meta: {
            type: 'object',
            properties: {
              totalItems: {
                type: 'number',
                example: 100,
                description: 'Total number of items',
              },
              currentPage: {
                type: 'number',
                example: 1,
                description: 'Current page number',
              },
              totalPages: {
                type: 'number',
                example: 10,
                description: 'Total number of pages',
              },
              hasNextPage: {
                type: 'boolean',
                example: true,
                description: 'Whether there is a next page',
              },
              hasPreviousPage: {
                type: 'boolean',
                example: false,
                description: 'Whether there is a previous page',
              },
              limit: {
                type: 'number',
                example: 10,
                description: 'Number of items per page',
              },
            },
            description: 'Pagination metadata',
          },
          links: {
            type: 'object',
            properties: {
              first: {
                type: 'string',
                example: '/api/resource?page=1&limit=10',
                description: 'URL to first page',
              },
              previous: {
                type: 'string',
                example: '/api/resource?page=1&limit=10',
                description: 'URL to previous page',
              },
              next: {
                type: 'string',
                example: '/api/resource?page=2&limit=10',
                description: 'URL to next page',
              },
              last: {
                type: 'string',
                example: '/api/resource?page=10&limit=10',
                description: 'URL to last page',
              },
              current: {
                type: 'string',
                example: '/api/resource?page=1&limit=10',
                description: 'URL to current page',
              },
            },
            description: 'Pagination navigation links',
          },
        },
      },
    },
  };
}

export function createSingleResponseSchema<T>(
  itemType: Type<T>,
  message: string = 'Request successful'
) {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: message },
      data: { $ref: getSchemaPath(itemType) },
    },
  };
}

export function createArrayResponseSchema<T>(
  itemType: Type<T>,
  message: string = 'Request successful'
) {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: message },
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(itemType) },
        description: 'Array of items',
      },
    },
  };
}

export function createEmptyResponseSchema(
  message: string = 'Operation successful'
) {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: message },
      data: { type: 'object', nullable: true, example: null },
    },
  };
}



export function createSimpleObjectResponseSchema(
  properties: Record<string, any>,
  message: string = 'Request successful'
) {
  return {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: message },
      data: {
        type: 'object',
        properties,
      },
    },
  };
}

