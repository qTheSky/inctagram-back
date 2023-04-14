import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/classes/abstract.repository';

export class PostsRepository extends AbstractRepository<PostEntity> {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>
  ) {
    super(postsRepository);
  }
}
