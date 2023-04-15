import { badRequestSwaggerMessage } from './bad-request-swagger-message';
import { BadRequestApiExample } from '../../schema/bad-request-schema-example';

export const apiBadRequestResponse = {
  description: badRequestSwaggerMessage,
  schema: BadRequestApiExample,
};
