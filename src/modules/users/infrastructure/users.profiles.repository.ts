import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersProfilesRepository extends AbstractRepository<UserProfileEntity> {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepository: Repository<UserProfileEntity>
  ) {
    super(userProfileRepository);
  }

  async getUserProfile(userId: string): Promise<UserProfileEntity | null> {
    return await this.userProfileRepository.findOne({
      where: { userId },
      select: [
        'name',
        'surName',
        'userName',
        'aboutMe',
        'dateOfBirthday',
        'city',
      ],
    });
  }
}
