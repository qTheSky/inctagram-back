import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordRecoveryModel {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
  })
  email: string;
  @ApiProperty({
    description: 'Link for email. this link will be send to user email',
    example: 'http://localhost:8000/auth/email-verification',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  frontendLink: string;
}
