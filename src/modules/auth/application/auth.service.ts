import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshPayload } from '../interfaces/jwt.payloads.interface';
import { UsersRepository } from '../../users/infrastructure';
import { BadRefreshTokensRepository } from '../../security/infrastructure/bad-refresh-tokens.repository';
import { ILoginTokens } from '../interfaces/login-tokens.interface';
import { BadRefreshTokenEntity } from '../../security/entities/bad-refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersRepository: UsersRepository,
    private badRefreshTokensRepository: BadRefreshTokensRepository
  ) {}

  async generateTokens(
    userId: string,
    deviceId?: string
  ): Promise<ILoginTokens> {
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
    const { exp, userId, deviceId, iat } = this.jwtService.decode(
      refreshToken
    ) as RefreshPayload;
    const user = await this.usersRepository.findOne({ id: userId });
    const badToken = await BadRefreshTokenEntity.create(
      user,
      refreshToken,
      exp
    );
    await this.badRefreshTokensRepository.save(badToken);
    return { iat, exp, userId, deviceId };
  }

  async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
