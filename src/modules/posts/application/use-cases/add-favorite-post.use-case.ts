import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../../modules/users/infrastructure';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { NotFoundException } from '@nestjs/common';

export class AddFavoritePostCommand {
  constructor(public userId: string, public postId: string) {}
}

@CommandHandler(AddFavoritePostCommand)
export class AddFavoritePostUseCase
  implements ICommandHandler<AddFavoritePostCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}
  async execute({ userId, postId }: AddFavoritePostCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    user.addFavoritePost(post);
    await this.usersRepository.save(user);
  }
}
