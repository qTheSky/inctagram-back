import { PostEntity } from '../../../modules/posts/entities/post.entity';
import { UserEntity } from '../../../modules/users/entities';
import { BaseEntity } from '../../../modules/shared/classes/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('comments')
export class CommentEntity extends BaseEntity {
  @ManyToOne(() => PostEntity, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: PostEntity;
  @Column('uuid')
  postId: string;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column('uuid')
  userId: string;

  @Column()
  content: string;
  @Column()
  createdAt: Date;

  static create(
    user: UserEntity,
    post: PostEntity,
    content: string
  ): CommentEntity {
    const newComment = new CommentEntity();
    newComment.id = randomUUID();
    newComment.user = user;
    newComment.post = post;
    newComment.content = content;
    newComment.createdAt = new Date();

    user.comments.push(newComment);
    post.comments.push(newComment);

    return newComment;
  }

  update(content: string): void {
    this.content = content;
  }
}
