import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PostEntity } from './post.entity';
import { BaseEntity } from '../../../modules/shared/classes/base.entity';
import { randomUUID } from 'crypto';

@Entity('posts_photos')
export class PostPhotoEntity extends BaseEntity {
  @Column()
  postId: string;
  @Column({ nullable: true })
  photoPath: string | null;

  @ManyToOne(() => PostEntity, (p) => p.photos, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: PostEntity;

  static create(post: PostEntity): PostPhotoEntity {
    const photo = new PostPhotoEntity();
    photo.id = randomUUID();
    photo.post = post;
    photo.photoPath = null;
    return photo;
  }
}
