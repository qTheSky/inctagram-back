import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryColumn({ unique: true })
  deviceId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  userId: number;

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
}
