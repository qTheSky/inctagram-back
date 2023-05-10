import { Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentModel {
  @Length(20, 300)
  @ApiProperty({ minLength: 20, maxLength: 300 })
  content: string;
}
