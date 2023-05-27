import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../../modules/users/infrastructure';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeStatus } from '../../../../modules/shared/classes/like.model';

export class UpdateExtendedLikeStausCommand {
  constructor(
    public postId: string,
    public likeStatus: LikeStatus,
    public userId: string
  ) {}
}

@CommandHandler(UpdateExtendedLikeStausCommand)
export class UpdateExtendedLikeStausUseCase
  implements ICommandHandler<UpdateExtendedLikeStausCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}
  async execute({
    postId,
    likeStatus,
    userId,
  }: UpdateExtendedLikeStausCommand): Promise<void> {
    const post = await this.postsQueryRepository.findPostById(postId);
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!post || !user) {
      throw new NotFoundException();
    }

    post.updateLikeStatus(likeStatus, user);
    await this.postsRepository.save(post);
  }
}
