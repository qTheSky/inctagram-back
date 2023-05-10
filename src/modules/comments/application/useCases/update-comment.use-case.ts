import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public currentUserId: string,
    public content: string
  ) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}
  async execute({
    commentId,
    currentUserId,
    content,
  }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId
    );
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    if (comment.userId !== currentUserId) {
      throw new ForbiddenException(
        "You can't update a comment that isn't yours"
      );
    }
    comment.update(content);
    await this.commentsRepository.save(comment);
  }
}
