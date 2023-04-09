import {
  IsUUID,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../../users/infrastructure/users.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsConfirmationCodeValidConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: UsersRepository) {}
  async validate(code: string) {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(
      code
    );
    if (!user) return false;
    return user.isEmailCanBeConfirmed(code);
  }
}

export class EmailConfirmDto {
  @Validate(IsConfirmationCodeValidConstraint, { message: 'code is wrong' })
  @IsUUID()
  @ApiProperty({
    description: 'Confirmation code',
    example: 'someUUIDdsajkdsa-dsad-as-das-ddsa',
    type: 'string',
    format: 'email',
  })
  code: string;
}
