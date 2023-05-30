import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  email: string;
}
export class LoginDto {
  @IsString()
  @ApiProperty()
  loginOrEmail: string;
  @IsString()
  @ApiProperty()
  password: string;
}
