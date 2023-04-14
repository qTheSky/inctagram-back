import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEntity } from '../../users/entities';
import { randomUUID } from 'crypto';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column()
  description: string;
  @Column({ nullable: null })
  photoPath: string | null;

  @ManyToOne(() => UserEntity, (u) => u.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;

  static create(user: UserEntity, description: string): PostEntity {
    const post = new PostEntity();
    post.id = randomUUID();
    post.user = user;
    post.description = description;
    post.photoPath = null;
    return post;
  }
}
