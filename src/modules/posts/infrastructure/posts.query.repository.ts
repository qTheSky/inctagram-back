import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { In, Repository } from 'typeorm';
import { PostViewModel } from '../api/dto/view/PostViewModel';
import { ConfigService } from '@nestjs/config';
import { PaginatorInputModel } from '../../../modules/shared/pagination/paginator.model';
import { orderSort } from '../../../modules/shared/pagination/create.order';
import { UserEntity } from '../../../modules/users/entities';
import { Paginated } from '../../../modules/shared/pagination/paginator';

export class PostsQueryRepository {
  constructor(
    @InjectRepository(PostEntity)
    private postsQueryRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private usersQueryRepository: Repository<UserEntity>,
    private readonly configService: ConfigService
  ) {}

  buildResponsePosts(post: PostEntity): PostViewModel {
    return {
      id: post.id,
      //photoUrl: this.configService.get("FILES_URL") + post.photoPath,
      photos: post.photos.map(
        (photo) => this.configService.get('FILES_URL') + photo.photoPath
      ),
      description: post.description,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async findPostById(id: string): Promise<PostEntity> {
    return await this.postsQueryRepository.findOne({
      where: { id },
      relations: { photos: true },
    });
  }

  async findFavoritePostByUserId(
    userId: string,
    postId: string
  ): Promise<PostEntity> {
    const post = await this.postsQueryRepository.findOne({
      where: { id: postId },
      relations: { photos: true, users: true },
    });
    if (post.users.find((user) => user.id === userId)) return post;
    return null;
  }

  async findAllFavoriteUserPosts(
    userId: string,
    query?: PaginatorInputModel
  ): Promise<Paginated<PostViewModel[]>> {
    const user = await this.usersQueryRepository.findOne({
      where: { id: userId },
      relations: { favoritePosts: true },
    });

    const allFavoriteUserPosts = user.favoritePosts;

    const postsIds = allFavoriteUserPosts.map((post) => post.id);

    const order = orderSort(query.sort);
    const page = query.pageNumber;
    const size = query.pageSize;
    const skip: number = (page - 1) * page;
    const totalCount = allFavoriteUserPosts.length;

    const [items] = await this.postsQueryRepository.findAndCount({
      where: { id: In(postsIds) },
      relations: ['photos'],
      take: page,
      skip,
      order,
    });

    const paginatedPosts = Paginated.getPaginated<PostViewModel[]>({
      items: items.map((post) => this.buildResponsePosts(post)),
      page: page,
      size: size,
      count: totalCount,
    });

    return paginatedPosts;
  }
}
