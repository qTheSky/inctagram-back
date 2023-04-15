import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostsController } from './api/posts.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/posts.query.repository';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';

const useCases = [CreatePostUseCase, UpdatePostUseCase, DeletePostUseCase];
const adapters = [PostsRepository, PostsQueryRepository];

@Module({
  imports: [
    CqrsModule,
    FilesModule,
    UsersModule,
    TypeOrmModule.forFeature([PostEntity]),
  ],
  providers: [...useCases, ...adapters],
  controllers: [PostsController],
})
export class PostsModule {}
