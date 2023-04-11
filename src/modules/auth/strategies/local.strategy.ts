import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../users/entities';
import { LoginDto } from '../api/dto/input';
import { UsersQueryRepository } from '../../users/infrastructure';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersQueryRepository: UsersQueryRepository) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserEntity> {
    return await this.checkAuthCredentials({
      loginOrEmail,
      password,
    });
  }

  async checkAuthCredentials(
    authCredentialsModel: LoginDto
  ): Promise<UserEntity> {
    const { loginOrEmail, password } = authCredentialsModel;
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail
    );
    if (!user) throw new UnauthorizedException('Incorrect credentials');
    if (!user.emailConfirmation.isConfirmed)
      throw new UnauthorizedException('Confirm your email first');
    const isHashesEquals = await bcrypt.compare(password, user.passwordHash);
    if (!isHashesEquals)
      throw new UnauthorizedException('Incorrect credentials');
    return user;
  }
}
