import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEntity } from '../../users/entities';
import { randomUUID } from 'crypto';
import { PostPhotoEntity } from './post.photo.entity';
import { CommentEntity } from '../../../modules/comments/entities/comment.entity';
import { PostLikeInfo } from './post.like-info.entity';

import {
  ExtendedLikesInfoViewModel,
  LikeDetailsViewModel,
} from '../api/dto/view/PostViewModel';
import { LikeStatus } from '../../../modules/shared/classes/like.model';

export interface IExtendedLikeInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: Array<LikeDetailsViewModel>;
}

@Entity('posts')
export class PostEntity extends BaseEntity {
  @Column()
  description: string;

  @ManyToOne(() => UserEntity, (u) => u.posts, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;

  @Column()
  isVisible: boolean;

  @OneToMany(
    () => PostLikeInfo,
    (extendedLikesInfo) => extendedLikesInfo.post,
    { cascade: true }
  )
  extendedLikesInfo: PostLikeInfo[];

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
    post.extendedLikesInfo = [];
    post.isVisible = true;
    return post;
  }

  getUserLikeStatus(userId: string): PostLikeInfo | undefined {
    return this.extendedLikesInfo.find(
      (userInfo) => userInfo.userId === userId
    );
  }

  getCountLikeStatus(likeStatus: LikeStatus): number {
    const sumStatus = this.extendedLikesInfo.reduce(
      (acc, extendedLikesInfo) => {
        if (
          extendedLikesInfo.status === likeStatus &&
          !extendedLikesInfo.isBanned
        )
          return acc + 1;
        return acc;
      },
      0
    );
    return sumStatus ? sumStatus : 0;
  }

  getLikeStatus(userId: string): ExtendedLikesInfoViewModel {
    let status;
    const myStatus = this.getUserLikeStatus(userId);
    typeof myStatus !== 'undefined'
      ? (status = myStatus.status)
      : (status = LikeStatus.NONE);

    const newestLikes = this.getNewestLikes();
    return {
      likesCount: this.getCountLikeStatus(LikeStatus.LIKE),
      dislikesCount: this.getCountLikeStatus(LikeStatus.DISLIKE),
      myStatus: status,
      newestLikes: newestLikes.map((likes) => {
        return {
          userId: likes.userId,
          login: likes.login,
          addedAt: likes.addedAt.toISOString(),
        };
      }),
    };
  }

  getNewestLikes(): Array<PostLikeInfo> {
    const responseNewestLikes = this.extendedLikesInfo.filter(
      (likeInfo) => likeInfo.status === LikeStatus.LIKE
    );
    if (responseNewestLikes.length > 3) {
      return responseNewestLikes.slice(-3).reverse();
    } else return responseNewestLikes.reverse();
  }

  updateLikeStatus(likeStatus: LikeStatus, user: UserEntity): void {
    const myStatus = this.getUserLikeStatus(user.id);
    if (myStatus) {
      this.extendedLikesInfo = this.extendedLikesInfo.map(
        (extendedLikesInfo) => {
          if (extendedLikesInfo.userId === user.id) {
            return {
              ...extendedLikesInfo,
              addedAt: new Date(),
              status: likeStatus,
            };
          }
          return extendedLikesInfo;
        }
      );
    } else {
      const userLikeInfo = new PostLikeInfo();
      userLikeInfo.id = randomUUID();
      userLikeInfo.addedAt = new Date();
      userLikeInfo.userId = user.id;
      userLikeInfo.login = user.login;
      userLikeInfo.isBanned = false;
      userLikeInfo.status = likeStatus;
      this.extendedLikesInfo.push(userLikeInfo);
    }
  }
}
