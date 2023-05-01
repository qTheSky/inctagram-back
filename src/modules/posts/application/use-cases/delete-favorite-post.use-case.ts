import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../../modules/users/infrastructure';
import { NotFoundException } from '@nestjs/common';

export class DeleteFavoritePostCommand {
  constructor(public userId: string, public postId: string) {}
}

@CommandHandler(DeleteFavoritePostCommand)
export class DeleteFavoritePostUseCase
  implements ICommandHandler<DeleteFavoritePostCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository
  ) {}
  async execute({ userId, postId }: DeleteFavoritePostCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    user.deleteFavoritePost(postId);
    await this.usersRepository.save(user);
  }
}
