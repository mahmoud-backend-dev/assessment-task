import { SetMetadata } from '@nestjs/common';

export enum OperationType {
  GET_ONE_SUCCESSFULLY = 'GET_ONE_SUCCESSFULLY',
  GET_ALL_SUCCESSFULLY = 'GET_ALL_SUCCESSFULLY',
  CREATED_SUCCESSFULLY = 'CREATED_SUCCESSFULLY',
  UPDATED_SUCCESSFULLY = 'UPDATED_SUCCESSFULLY',
  DELETED_SUCCESSFULLY = 'DELETED_SUCCESSFULLY',
  OPERATION_SUCCESSFUL = 'OPERATION_SUCCESSFUL',
}

export enum ModuleName {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  GENERAL = 'GENERAL',
}

export const RESPONSE_MESSAGE = 'response_message';

export const ResponseMessage = (
  message: [OperationType, ModuleName?]
) => SetMetadata(RESPONSE_MESSAGE, message);
