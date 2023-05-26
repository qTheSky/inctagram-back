import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { AbstractLikeInfo } from '../../../modules/shared/classes/abstract.like-info.class';

@Entity('comment_like_info')
export class CommentLikeInfo extends AbstractLikeInfo {
  @ManyToOne(() => CommentEntity, (comment) => comment.likeInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: CommentEntity;
}
