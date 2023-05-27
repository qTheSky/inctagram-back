import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../api/dto/input/update-post.dto';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdatePostCommand {
  constructor(
    public dto: UpdatePostDto,
    public currentUserId: string,
    public postId: string
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository
  ) {}
  async execute({
    dto,
    currentUserId,
    postId,
  }: UpdatePostCommand): Promise<any> {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    if (post.userId !== currentUserId) {
      throw new ForbiddenException();
    }
    post.description = dto.description;
    await this.postsRepository.save(post);
    return this.postsQueryRepository.buildResponsePosts(post, currentUserId);
  }
}
