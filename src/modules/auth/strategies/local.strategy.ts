import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { LoginDto } from '../api/dto/input/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepository: UsersRepository) {
    super({
      usernameField: 'userNameOrEmail',
    });
  }

  async validate(
    userNameOrEmail: string,
    password: string
  ): Promise<UserEntity> {
    return await this.checkAuthCredentials({
      userNameOrEmail,
      password,
    });
  }

  async checkAuthCredentials(
    authCredentialsModel: LoginDto
  ): Promise<UserEntity> {
    const { userNameOrEmail, password } = authCredentialsModel;
    const user = await this.usersRepository.findUserByLoginOrEmail(
      userNameOrEmail
    );
    if (!user) throw new UnauthorizedException('Incorrect credentials');
    if (!user.emailConfirmation.isConfirmed)
      throw new UnauthorizedException('Confirm your email first');
    // if (user.banInfo.isBanned)
    //   throw new UnauthorizedException('You are banned');
    const isHashesEquals = await bcrypt.compare(password, user.passwordHash);
    if (!isHashesEquals)
      throw new UnauthorizedException('Incorrect credentials');
    return user;
  }
}
