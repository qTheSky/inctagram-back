import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../shared/interceptors/transactions/entityManager.context';

export class PostsRepository extends AbstractRepository<PostEntity> {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(postsRepository, entityManagerContext);
  }
}
