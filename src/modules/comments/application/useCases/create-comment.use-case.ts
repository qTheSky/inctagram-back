import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsQueryRepository } from '../../../../modules/posts/infrastructure/posts.query.repository';
import { UsersQueryRepository } from '../../../../modules/users/infrastructure';
import { CommentViewModel } from '../../api/models/view/comment.view.model';
import { CommentsQueryRepository } from '../../infrastructure/comments.query.repository';
import { CommentEntity } from '../../entities/comment.entity';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public userId: string,
    public content: string
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    @Inject(forwardRef(() => PostsQueryRepository))
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}
  async execute({
    postId,
    userId,
    content,
  }: CreateCommentCommand): Promise<CommentViewModel> {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    const user = await this.usersQueryRepository.findUserById(userId);
    const newComment = CommentEntity.create(user, post, content);
    await this.commentsRepository.save(newComment);
    return this.commentsQueryRepository.buildResponseComment(newComment);
  }
}
