import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { UsersProfilesRepository } from '../../infrastructure';

export class GetUserProfileQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly usersProfilesRepository: UsersProfilesRepository
  ) {}

  async execute({ userId }: GetUserProfileQuery) {
    const cachedProfile = await this.redis.get(`profile${userId}`);
    if (cachedProfile) return JSON.parse(cachedProfile);
    const profile = await this.usersProfilesRepository.findOne({ userId });
    if (!profile) throw new NotFoundException('Profile not found');
    const profileViewModel =
      await this.usersProfilesRepository.buildProfileViewModel(profile);
    await this.redis.set(
      `profile${userId}`,
      JSON.stringify(profileViewModel),
      'EX',
      60 * 10 //10 min
    );
    return profileViewModel;
  }
}
