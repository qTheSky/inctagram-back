import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class LikeInputModel {
  @ApiProperty({
    enum: LikeStatus,
  })
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
