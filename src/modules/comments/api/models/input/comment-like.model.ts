import { LikeStatus } from '../../../../../modules/shared/classes/abstract.like-info.class';
import { ApiProperty } from '@nestjs/swagger';

export class LikeInputModel {
  @ApiProperty({
    enum: LikeStatus,
  })
  likeStatus: LikeStatus;
}
