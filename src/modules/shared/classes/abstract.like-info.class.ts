import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Entity()
export abstract class AbstractLikeInfo {
  @PrimaryColumn()
  id: string;
  @Column()
  addedAt: Date;
  @Column()
  userId: string;
  @Column()
  login: string;
  @Column()
  status: LikeStatus;
  @Column()
  isBanned: boolean;
}
