import { badRequestSwaggerMessage } from './bad-request-swagger-message';
import { BadRequestApiExample } from './bad-request-schema-example';

export const apiBadRequestResponse = {
  description: badRequestSwaggerMessage,
  schema: BadRequestApiExample,
};
