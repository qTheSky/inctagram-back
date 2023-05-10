import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEntity } from '../../users/entities';
import { randomUUID } from 'crypto';
import { PostPhotoEntity } from './post.photo.entity';
import { CommentEntity } from '../../../modules/comments/entities/comment.entity';

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column()
  description: string;

  @ManyToOne(() => UserEntity, (u) => u.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;

  @OneToMany(() => PostPhotoEntity, (p) => p.post, {
    cascade: true,
  })
  photos: PostPhotoEntity[];

  @ManyToMany(() => UserEntity, (users) => users.favoritePosts)
  users: UserEntity[];

  @OneToMany(() => CommentEntity, (comments) => comments.post, {
    cascade: true,
  })
  comments: CommentEntity[];

  static create(user: UserEntity, description: string): PostEntity {
    const post = new PostEntity();
    post.id = randomUUID();
    post.user = user;
    post.description = description;
    post.photos = [];
    return post;
  }

  update() {}
}
