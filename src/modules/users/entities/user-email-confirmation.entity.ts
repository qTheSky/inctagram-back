import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('users_email_confirmation')
export class UserEmailConfirmation {
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;

  @OneToOne(() => UserEntity, (u) => u.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn()
  userId: string;
}
