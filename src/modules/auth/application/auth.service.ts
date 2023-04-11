import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshPayload } from '../interfaces/jwt.payloads.interface';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BadRefreshTokensRepository } from '../../security/infrastructure/bad-refresh-tokens.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private badRefreshTokensRepository: BadRefreshTokensRepository
  ) {}

  async generateTokens(userId: string, deviceId?: string) {
    const accessToken = this.jwtService.sign({ userId });
    const refreshToken = this.jwtService.sign(
      { userId, deviceId: deviceId || randomUUID() },
      { expiresIn: this.configService.get('REFRESH_TOKEN_TIME') }
    );
    return { accessToken, refreshToken };
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
    userId: number,
    refreshToken: string
  ): Promise<boolean> {
    const foundRefreshToken =
      await this.badRefreshTokensRepository.findRefreshToken(
        userId,
        refreshToken
      );
    if (foundRefreshToken) throw new UnauthorizedException();
    return !!foundRefreshToken;
  }

  async putRefreshTokenToBlackList(
    refreshToken: string
  ): Promise<RefreshPayload> {
    const { exp, userId, deviceId, iat } = this.jwtService.decode(
      refreshToken
    ) as RefreshPayload;
    const user = await this.usersRepository.findOne({ id: userId });
    await this.badRefreshTokensRepository.create(
      user,
      refreshToken,
      +userId,
      exp
    );
    return { iat, exp, userId, deviceId };
  }

  async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
