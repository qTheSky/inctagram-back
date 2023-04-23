import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserProfileDto } from '../../api/dto/input/user-profile.dto';
import { UsersRepository } from '../../infrastructure';
import { UsersProfilesRepository } from '../../infrastructure';

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
    const profile = await this.usersProfilesRepository.findOne({
      userId: currentUserId,
    });
    profile.update(dto);
    await this.usersProfilesRepository.save(profile);
  }
}
