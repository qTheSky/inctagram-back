import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractLikeInfo } from '../../../modules/shared/classes/abstract.like-info.class';
import { PostEntity } from './post.entity';

@Entity('post_like_info')
export class PostLikeInfo extends AbstractLikeInfo {
  @ManyToOne(() => PostEntity, (post) => post.extendedLikesInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  post: PostEntity;
}
