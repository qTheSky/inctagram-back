import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    description: 'post description',
    example: 'frontend noobs',
    type: String,
  })
  @Length(1, 500)
  @IsString()
  @IsNotEmpty()
  description: string;
}
