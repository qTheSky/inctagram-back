import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    description: 'post description',
    example: 'frontend noobs',
    type: String,
  })
  @IsString()
  description: string;
}
