import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { PostViewModel } from '../api/dto/view/PostViewModel';
import { ConfigService } from '@nestjs/config';

export class PostsQueryRepository {
  constructor(
    @InjectRepository(PostEntity)
    private postsQueryRepository: Repository<PostEntity>,
    private readonly configService: ConfigService
  ) {}

  buildResponsePosts(post: PostEntity): PostViewModel {
    return {
      photoUrl: this.configService.get('FILES_URL') + post.photoPath,
      description: post.description,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
}
