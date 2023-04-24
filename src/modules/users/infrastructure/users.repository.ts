import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../shared/interceptors/transactions/entityManager.context';

@Injectable()
export class UsersRepository extends AbstractRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(usersRepository, entityManagerContext);
  }
}
