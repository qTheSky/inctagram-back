import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../../modules/users/infrastructure';
import { NotFoundException } from '@nestjs/common';

export class DeleteAllFavoritePostCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAllFavoritePostCommand)
export class DeleteAllFavoritePostUseCase
  implements ICommandHandler<DeleteAllFavoritePostCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository
  ) {}
  async execute({ userId }: DeleteAllFavoritePostCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    user.deleteAllFavoritePost();
    await this.usersRepository.save(user);
  }
}
