import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../api/dto/input/create-post.dto';
import { validateImage } from '../../../files/utils/validate-image';
import { FilesManager } from '../../../files/application/files.manager';
import { UsersQueryRepository } from '../../../users/infrastructure';
import { PostEntity } from '../../entities/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostDto, public currentUserId: string) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private filesManager: FilesManager,
    private usersQueryRepository: UsersQueryRepository,
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository
  ) {}

  async execute(command: CreatePostCommand) {
    const user = await this.usersQueryRepository.findUserById(
      command.currentUserId
    );
    const { validatedImage } = await validateImage(command.dto.file, {
      maxFileSizeKB: 1000,
    });

    const post = PostEntity.create(user, command.dto.description);
    const { url } = await this.filesManager.uploadFile(
      `content/posts/${post.id}`,
      validatedImage
    );
    post.photoPath = url;
    const savedPost = await this.postsRepository.save(post);
    return this.postsQueryRepository.buildResponsePosts(savedPost);
  }
}
