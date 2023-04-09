import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRefreshTokenEntity } from '../entities/bad-refresh-token.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class BadRefreshTokensRepository {
  constructor(
    @InjectRepository(BadRefreshTokenEntity)
    private readonly repo: Repository<BadRefreshTokenEntity>
  ) {}
  async create(
    user: UserEntity,
    refreshToken: string,
    userId: number,
    exp: number
  ) {
    const newDocument = new BadRefreshTokenEntity();
    newDocument.refreshToken = refreshToken;
    newDocument.userId = userId;
    newDocument.expiresIn = exp;

    newDocument.user = user;
    return this.repo.save(newDocument);
  }

  async findRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<BadRefreshTokenEntity | null> {
    return this.repo.findOneBy({ userId, refreshToken });
  }
}
