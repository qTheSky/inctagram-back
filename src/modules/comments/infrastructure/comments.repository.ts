import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManagerContext } from '../../../modules/shared/interceptors/transactions/entityManager.context';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { AbstractRepository } from '../../../modules/shared/classes/abstract.repository';

@Injectable()
export class CommentsRepository extends AbstractRepository<CommentEntity> {
  constructor(
    @InjectRepository(CommentEntity)
    private commentsRepository: Repository<CommentEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(commentsRepository, entityManagerContext);
  }
}
