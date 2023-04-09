import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty()
  loginOrEmail: string;
  @IsString()
  @ApiProperty()
  password: string;
}
