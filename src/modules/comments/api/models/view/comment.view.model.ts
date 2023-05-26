import { IsEnum, IsNumber, IsString } from 'class-validator';
import { LikeStatus } from '../../../../../modules/shared/classes/abstract.like-info.class';

export class LikesInfoViewModel {
  @IsNumber()
  likesCount: number;
  @IsNumber()
  dislikesCount: number;
  @IsString()
  @IsEnum(LikeStatus)
  myStatus: LikeStatus;
}

export class CommentViewModel {
  @IsString()
  id: string;
  @IsString()
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  @IsString()
  createdAt: string;
  likesInfo: LikesInfoViewModel;
}
