import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEntity } from './user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('users_subscriptions')
export class UserSubscriptionEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscribeFromId' })
  subscribeFrom: UserEntity;
  subscribeFromId: string;

  @ManyToOne(() => UserEntity, (user) => user.subscribers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscribeToId' })
  subscribeTo: UserEntity;
  subscribeToId: string;
}
