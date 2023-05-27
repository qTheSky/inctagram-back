import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../api/dto/input/create-post.dto';
import { validateImage } from '../../../files/utils/validate-image';
import { FilesManager } from '../../../files/application/files.manager';
import { UsersQueryRepository } from '../../../users/infrastructure';
import { PostEntity } from '../../entities/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostViewModel } from '../../api/dto/view/PostViewModel';
import { PostPhotoEntity } from '../../entities/post.photo.entity';

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

  async execute(command: CreatePostCommand): Promise<PostViewModel> {
    const user =
      await this.usersQueryRepository.findUserByIdWithEmailConfirmation(
        command.currentUserId
      );
    const { files } = command.dto;
    const post = PostEntity.create(user, command.dto.description);
    for (const file of files) {
      const { validatedImage } = await validateImage(file, {
        maxFileSizeKB: 1000,
      });

      const newPhoto = PostPhotoEntity.create(post);
      const { url } = await this.filesManager.uploadFile(
        `content/posts/${post.id}/photo/${newPhoto.id}`,
        validatedImage
      );

      newPhoto.photoPath = url;
      newPhoto.mimetype = file.mimetype;
      newPhoto.size = file.size;
      post.photos.push(newPhoto);
    }

    const savedPost = await this.postsRepository.save(post);
    return this.postsQueryRepository.buildResponsePosts(
      savedPost,
      command.currentUserId
    );
  }
}
