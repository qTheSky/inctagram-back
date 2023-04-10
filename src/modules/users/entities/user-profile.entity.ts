import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserProfileDto } from '../api/dto/input/user-profile.dto';

@Entity('user_profile')
export class UserProfileEntity {
  @Column({ nullable: true })
  userName: string | null;
  @Column({ nullable: true })
  name: string | null;
  @Column({ nullable: true })
  surName: string | null;
  @Column({ nullable: true })
  dateOfBirthday: Date | null;
  @Column({ nullable: true })
  city: string | null;
  @Column({ nullable: true })
  aboutMe: string | null;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @PrimaryColumn('uuid')
  userId: string;

  update(dto: UserProfileDto) {
    const dtoKeys = Object.keys(dto);
    for (const key of dtoKeys) {
      this[key] = dto[key];
    }
  }
}
