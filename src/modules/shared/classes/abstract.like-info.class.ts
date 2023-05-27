import { Column, Entity, PrimaryColumn } from 'typeorm';
import { LikeStatus } from './like.model';

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
