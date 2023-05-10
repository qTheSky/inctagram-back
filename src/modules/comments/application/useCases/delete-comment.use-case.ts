import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { CommentsQueryRepository } from "../../infrastructure/comments.query.repository";
import { CommentsRepository } from "../../infrastructure/comments.repository";

export class DeleteCommentCommand {
  constructor(public commentId: string, public currentUserId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}
  async execute({
    commentId,
    currentUserId,
  }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId
    );
    if (!comment) throw new NotFoundException("Comment doesnt exist");
    if (comment.userId !== currentUserId) {
      throw new ForbiddenException(
        "You can't delete a comment that isn't yours"
      );
    }
    await this.commentsRepository.delete(comment);
  }
}
