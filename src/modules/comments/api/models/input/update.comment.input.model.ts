import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentModel {
  @Length(20, 300)
  @ApiProperty({
    description: 'Data for updating',
    type: 'string',
    minLength: 20,
    maxLength: 300,
  })
  content: string;
}
