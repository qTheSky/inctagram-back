import { BaseEntity } from 'src/modules/shared/classes/base.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('AUTH_UsersPasswordRecovery')
export class UserPasswordRecoveryEntity extends BaseEntity {
  @PrimaryColumn('uuid')
  userId: string;
  @Column()
  recoveryCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isCodeAlreadyUsed: boolean;

  @OneToOne(() => UserEntity, (user) => user.passwordRecovery, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
