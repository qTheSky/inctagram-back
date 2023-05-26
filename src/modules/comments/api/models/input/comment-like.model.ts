import { IsEnum, IsString } from "class-validator";
import { LikeStatus } from "../../../../../modules/shared/classes/abstract.like-info.class";

export class LikeInputModel {
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
