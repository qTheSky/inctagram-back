import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { SubscriptionSubjectType } from '../enums/susbscription-type.enum';
import { UserEntity } from '../../users/entities';

@Entity('paid_subscriptions')
export class PaidSubscriptionEntity extends BaseEntity {
  @Column()
  subject: SubscriptionSubjectType;

  @ManyToOne(() => UserEntity, (u) => u.paidSubscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  userId: string;

  @Column()
  expiresAt: Date;
}
