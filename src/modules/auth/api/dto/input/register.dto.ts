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

@Injectable()
@ValidatorConstraint({ async: true })
export class IsEmailOrUserNameUniqueConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}

  async validate(loginOrEmail: string) {
    const user = await this.usersRepository.findUserByUserNameOrEmail(
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
  @Length(3, 10)
  @Matches('[a-zA-Z0-9_-]*$')
  @IsString()
  @ApiProperty({
    description: 'User name',
    example: 'John',
    type: 'string',
    minLength: 3,
    maxLength: 10,
  })
  userName: string;
  @Length(6, 20)
  @IsString()
  @ApiProperty({
    description: 'User password',
    example: 'string',
    type: 'string',
    minLength: 6,
    maxLength: 20,
  })
  password: string;
}
