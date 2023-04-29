import { BadRequestException } from '@nestjs/common';

export const badRequestException = (field: string, message: string) => {
  throw new BadRequestException([{ field, message }]);
};
