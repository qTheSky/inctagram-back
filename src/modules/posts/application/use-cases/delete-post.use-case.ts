import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FilesManager } from '../../../files/application/files.manager';

export class DeletePostCommand {
  constructor(public currentUserId: string, public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly postsRepository: PostsRepository,
    private filesManager: FilesManager
  ) {}

  async execute({ currentUserId, postId }: DeletePostCommand): Promise<void> {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    if (post.userId !== currentUserId) {
      throw new ForbiddenException();
    }

    for (const photo of post.photos) {
      await this.filesManager.deleteFile(photo.photoPath);
    }

    await this.postsRepository.delete(post);
  }
}
