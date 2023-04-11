import { Entity } from 'typeorm';

@Entity('users_ban_info')
export class UserBanInfoEntity {
  // @PrimaryColumn('uuid')
  // userId: string;
  // @Column()
  // isBanned: boolean;
  // @Column({ nullable: true })
  // banDate: Date;
  // @Column({ nullable: true })
  // banReason: string;
  //
  // @OneToOne(() => UserEntity, (user) => user.banInfo, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn()
  // user: UserEntity;
}
