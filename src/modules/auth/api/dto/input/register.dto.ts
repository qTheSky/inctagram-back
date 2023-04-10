import { Injectable } from '@nestjs/common';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';
import { ApiProperty } from '@nestjs/swagger';

@Injectable() //if validation uses dependency injection it must be injectable and registered in the module
@ValidatorConstraint({ async: true })
export class IsEmailOrUserNameUniqueConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(loginOrEmail: string) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      loginOrEmail
    );
    return !user;
  }
}

export class RegisterDto {
  @Validate(IsEmailOrUserNameUniqueConstraint, {
    message: 'Email already exist',
  })
  @IsEmail()
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    type: 'string',
    format: 'email',
  })
  email: string;
  @Validate(IsEmailOrUserNameUniqueConstraint, {
    message: 'Login already exist',
  })
  @Length(6, 30)
  @Matches('[a-zA-Z0-9_-]*$')
  @IsString()
  @ApiProperty({
    description: 'User login',
    example: 'John',
    type: 'string',
    minLength: 3,
    maxLength: 10,
  })
  login: string;
  @Length(6, 20)
  @IsString()
  @ApiProperty({
    description: 'User password',
    example: 'string',
    type: 'string',
    minLength: 6,
    maxLength: 20,
  })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^+=])[A-Za-z\d@$!%*#?&^+=]{8,}$/,
    {
      message:
        'passwords should be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character',
    }
  )
  password: string;
}
