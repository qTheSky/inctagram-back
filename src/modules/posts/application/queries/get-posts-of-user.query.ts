import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NewPagination } from '../../../shared/new-pagination/newPagination';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class GetPostsOfUserQuery {
  constructor(public userId: string, public query: NewPagination) {}
}

@QueryHandler(GetPostsOfUserQuery)
export class GetPostsOfUserQueryHandler
  implements IQueryHandler<GetPostsOfUserQuery>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute({ userId, query }: GetPostsOfUserQuery) {
    query.filters['userId'] = { op: 'eq', value: userId };

    const posts = await this.postsRepository.findManyAndCount(query);
    return posts;
    console.log(posts);
  }
}
