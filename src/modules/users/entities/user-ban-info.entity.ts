import { BaseEntity } from '../../../modules/shared/classes/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('AUTH_UsersBanInfo')
export class UserBanInfoEntity extends BaseEntity {
  @Column('uuid')
  userId: string;
  @Column()
  isBanned: boolean;
  @Column({ nullable: true })
  banDate: Date;
  @Column({ nullable: true })
  banReason: string;

  @OneToOne(() => UserEntity, (user) => user.banInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
