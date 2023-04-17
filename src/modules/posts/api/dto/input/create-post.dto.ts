import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    description: 'description',
    example: 'some post description',
    type: 'string',
  })
  @Length(1, 500)
  @IsString()
  description: string;
  @ApiProperty({
    description: 'FILE!!',
    example: 'MULTIPART FORM DATA',
    format: 'binary',
  })
  files: Array<Express.Multer.File>;
}
