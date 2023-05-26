import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { UsersQueryRepository } from '../../../../modules/users/infrastructure';
import { NotFoundException } from '@nestjs/common';
import { LikeStatus } from '../../../../modules/shared/classes/abstract.like-info.class';

export class UpdateLikeStatusCommand {
  constructor(
    public commentId: string,
    public likeStatus: LikeStatus,
    public userId: string
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase
  implements ICommandHandler<UpdateLikeStatusCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsRepository: CommentsRepository
  ) {}
  async execute({
    commentId,
    likeStatus,
    userId,
  }: UpdateLikeStatusCommand): Promise<void> {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId
    );
    const user = await this.usersQueryRepository.findUserById(userId);
    if (!comment || !user) {
      throw new NotFoundException();
    }
    comment.updateLikeStatus(likeStatus, user);
    await this.commentsRepository.save(comment);
  }
}
