import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserProfileViewModel } from '../api/dto/view/UserProfileViewModel';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersProfilesRepository extends AbstractRepository<UserProfileEntity> {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>,
    private readonly configService: ConfigService
  ) {
    super(userProfileRepository);
  }

  async getUserProfile(userId: string): Promise<UserProfileEntity | null> {
    return await this.userProfileRepository.findOne({
      where: { userId },
    });
  }

  async buildProfileViewModel(
    profile: UserProfileEntity
  ): Promise<UserProfileViewModel> {
    return {
      userName: profile.userName,
      city: profile.city,
      name: profile.name,
      surName: profile.surName,
      aboutMe: profile.aboutMe,
      dateOfBirthday: profile.dateOfBirthday,
      avatarUrl: this.configService.get('FILES_URL') + profile.avatarPath,
    };
  }
}
