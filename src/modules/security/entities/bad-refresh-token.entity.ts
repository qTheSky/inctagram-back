import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('bad_refresh_tokens')
export class BadRefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  userId: number;
  @Column()
  refreshToken: string;
  @Column()
  expiresIn: number;
}
