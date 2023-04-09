import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserProfileDto } from '../../api/dto/input/user-profile.dto';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersProfilesRepository } from '../../infrastructure/users.profiles.repository';

export class UpdateProfileCommand {
  constructor(public currentUserId: string, public dto: UserProfileDto) {}
}
@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersProfilesRepository: UsersProfilesRepository
  ) {}
  async execute({ currentUserId, dto }: UpdateProfileCommand) {
    const profile = await this.usersProfilesRepository.getUserProfile(
      currentUserId
    );
    console.log(profile);
    profile.update(dto);
    console.log(profile);
    await this.usersProfilesRepository.save(profile);
  }
}
