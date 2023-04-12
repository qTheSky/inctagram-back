import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersQueryRepository } from '../../../../../modules/users/infrastructure';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsCheckIsEmailConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  async validate(email: string) {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    return true;
  }
}

export class EmailResendModel {
  @Validate(IsCheckIsEmailConfirmedConstraint, {
    message: 'Email already confimed or doesnt exist',
  })
  @IsString()
  @IsEmail()
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
