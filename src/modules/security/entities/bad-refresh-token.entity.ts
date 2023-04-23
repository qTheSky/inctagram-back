import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities';

@Entity('bad_refresh_tokens')
export class BadRefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  userId: string;
  @Column()
  refreshToken: string;
  @Column()
  expiresIn: number;

  static create(
    user: UserEntity,
    refreshToken: string,
    expiresIn: number
  ): BadRefreshTokenEntity {
    const badToken = new BadRefreshTokenEntity();

    badToken.refreshToken = refreshToken;
    badToken.expiresIn = expiresIn;
    badToken.user = user;

    return badToken;
  }
}
