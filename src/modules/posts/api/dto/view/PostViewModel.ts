import { ApiProperty } from '@nestjs/swagger';
import { LikeStatus } from '../../../../../modules/shared/classes/like.model';

export class PhotoViewModel {
  photoUrl: string;
}

export class LikeDetailsViewModel {
  userId: string;
  login: string;
  addedAt: string;
}

export class ExtendedLikesInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: Array<LikeDetailsViewModel>;
}

export class PostViewModel {
  @ApiProperty({
    description: 'id',
    example: '3123213123',
    type: 'string',
  })
  id: string;
  @ApiProperty({
    description: 'photos url',
    example: '[https://url.com/photo1.jpg, https://url.com/photo1.jpg]',
    type: 'string[]',
    format: 'url',
  })
  photos: string[];
  @ApiProperty({
    description: 'post description',
    example: 'frontend noobs',
    type: 'string',
  })
  description: string;
  @ApiProperty({
    description: 'date when post was created',
    example: new Date('2023-04-10T16:20:10.847Z'),
    type: 'string',
  })
  createdAt: Date;
  @ApiProperty({
    description: 'date when post was created',
    example: new Date('2023-04-10T16:20:10.847Z'),
    type: 'string',
  })
  updatedAt: Date;
  @ApiProperty({
    description: 'post likes info',
    type: ExtendedLikesInfoViewModel,
  })
  extendedLikesInfo: ExtendedLikesInfoViewModel;
}
