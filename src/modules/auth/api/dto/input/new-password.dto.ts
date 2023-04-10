import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePasswordModel {
  @IsString()
  @ApiProperty({
    description: 'Recovery code',
    example: 'uuid-from-email-message',
    type: 'string',
  })
  recoveryCode: string;
  @Length(6, 20)
  @IsString()
  @ApiProperty({
    description: 'New Password',
    example: 'newpassword123',
    type: 'string',
    minLength: 6,
    maxLength: 20,
  })
  newPassword: string;
}
