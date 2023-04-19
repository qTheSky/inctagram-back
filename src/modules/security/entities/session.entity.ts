import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { RefreshPayload } from '../../../modules/auth/interfaces/jwt.payloads.interface';

@Entity('sessions')
export class SessionEntity {
  @PrimaryColumn({ unique: true })
  deviceId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column('uuid')
  userId: string;

  @Column()
  issuedAt: Date;

  @Column()
  expiresIn: Date;

  @Column()
  ip: string;

  @Column()
  deviceName: string;

  @Column()
  refreshToken: string;

  static create(
    user: UserEntity,
    dto: {
      decodedRefreshToken: RefreshPayload;
      ip: string;
      deviceName: string;
      refreshToken: string;
    }
  ): SessionEntity {
    const session = new SessionEntity();
    session.issuedAt = new Date(dto.decodedRefreshToken.iat * 1000);
    session.expiresIn = new Date(dto.decodedRefreshToken.exp * 1000);
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;
    session.deviceId = dto.decodedRefreshToken.deviceId;
    session.refreshToken = dto.refreshToken;
    session.user = user;
    return session;
  }
}
