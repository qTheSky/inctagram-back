import { PostEntity } from '../../../modules/posts/entities/post.entity';
import { UserEntity } from '../../../modules/users/entities';
import { BaseEntity } from '../../../modules/shared/classes/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { randomUUID } from 'crypto';

import { CommentLikeInfo } from './comment.like-info.entity';
import { LikeStatus } from '../../../modules/shared/classes/abstract.like-info.class';

export interface ILikeInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
}

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

  @Column()
  isVisible: boolean;

  @OneToMany(() => CommentLikeInfo, (likeInfo) => likeInfo.comment, {
    cascade: true,
  })
  likeInfo: CommentLikeInfo[];

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
    newComment.likeInfo = [];
    newComment.isVisible = true;

    user.comments.push(newComment);
    post.comments.push(newComment);

    return newComment;
  }

  update(content: string): void {
    this.content = content;
  }

  getUserLikeStatus(userId: string): CommentLikeInfo | undefined {
    return this.likeInfo.find((userInfo) => userInfo.userId === userId);
  }

  getCountLikeStatus(likeStatus: LikeStatus): number {
    const sumStatus = this.likeInfo.reduce((acc, likeInfo) => {
      if (likeInfo.status === likeStatus && !likeInfo.isBanned) return acc + 1;
      return acc;
    }, 0);
    return sumStatus ? sumStatus : 0;
  }

  getLikeStatus(userId: string): ILikeInfo {
    let status;
    const myStatus = this.getUserLikeStatus(userId);
    typeof myStatus !== 'undefined'
      ? (status = myStatus.status)
      : (status = LikeStatus.NONE);
    return {
      likesCount: this.getCountLikeStatus(LikeStatus.LIKE),
      dislikesCount: this.getCountLikeStatus(LikeStatus.DISLIKE),
      myStatus: status,
    };
  }

  updateLikeStatus(likeStatus: LikeStatus, user: UserEntity): void {
    const myStatus = this.getUserLikeStatus(user.id);
    if (myStatus) {
      this.likeInfo = this.likeInfo.map((likeInfo) => {
        if (likeInfo.userId === user.id) {
          return { ...likeInfo, addedAt: new Date(), status: likeStatus };
        }
        return likeInfo;
      });
    } else {
      const userLikeInfo = new CommentLikeInfo();
      userLikeInfo.id = randomUUID();
      userLikeInfo.addedAt = new Date();
      userLikeInfo.userId = user.id;
      userLikeInfo.login = user.login;
      userLikeInfo.isBanned = false;
      userLikeInfo.status = likeStatus;
      this.likeInfo.push(userLikeInfo);
    }
  }
}
