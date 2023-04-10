import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersQueryRepository } from 'src/modules/users/infrastructure';

@Injectable()
@ValidatorConstraint({ async: true })
export class CheckIsEmailConfirmedConstraint
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
  @Validate(CheckIsEmailConfirmedConstraint, {
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
}
