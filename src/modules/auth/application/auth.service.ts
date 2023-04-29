import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  AccessPayload,
  RefreshPayload,
} from '../interfaces/jwt.payloads.interface';
import { UsersRepository } from '../../users/infrastructure';
import { BadRefreshTokensRepository } from '../../security/infrastructure/bad-refresh-tokens.repository';
import { ILoginTokens } from '../interfaces/login-tokens.interface';
import { BadRefreshTokenEntity } from '../../security/entities/bad-refresh-token.entity';
import { UserEntity } from '../../users/entities';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private badRefreshTokensRepository: BadRefreshTokensRepository
  ) {}

  async generateTokens(
    user: UserEntity,
    deviceId?: string
  ): Promise<ILoginTokens> {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      login: user.login,
    });
    const refreshToken = this.jwtService.sign(
      { userId: user.id, deviceId: deviceId || randomUUID() },
      { expiresIn: this.configService.get('REFRESH_TOKEN_TIME') }
    );
    return { accessToken, refreshToken };
  }

  /**
   * this method is used in websocket connections
   */
  validateToken(accessToken?: string): AccessPayload | null {
    try {
      const payload: AccessPayload = this.jwtService.verify(accessToken);
      return payload;
    } catch (e) {
      return null;
    }
  }

  getUserIdByTokenOrThrow(token: string) {
    try {
      const payload: any = this.jwtService.verify(token);
      return payload.userId;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }

  async checkIsRefreshTokenInBlackList(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    const foundRefreshToken = await this.badRefreshTokensRepository.findOne({
      userId: userId,
      refreshToken,
    });
    if (foundRefreshToken) throw new UnauthorizedException();
    return !!foundRefreshToken;
  }

  async putRefreshTokenToBlackList(
    refreshToken: string
  ): Promise<RefreshPayload> {
    const { exp, userId, deviceId, iat, login } = this.jwtService.decode(
      refreshToken
    ) as RefreshPayload;
    const user = await this.usersRepository.findOne({ id: userId });
    const badToken = await BadRefreshTokenEntity.create(
      user,
      refreshToken,
      exp
    );
    await this.badRefreshTokensRepository.save(badToken);
    return { iat, exp, userId, deviceId, login };
  }

  async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
