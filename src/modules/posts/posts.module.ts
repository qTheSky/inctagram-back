import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostEntity } from "./entities/post.entity";
import { PostsController } from "./api/posts.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { CreatePostUseCase } from "./application/use-cases/create-post.use-case";
import { FilesModule } from "../files/files.module";
import { UsersModule } from "../users/users.module";
import { PostsRepository } from "./infrastructure/posts.repository";
import { PostsQueryRepository } from "./infrastructure/posts.query.repository";
import { UpdatePostUseCase } from "./application/use-cases/update-post.use-case";
import { DeletePostUseCase } from "./application/use-cases/delete-post.use-case";
import { PostPhotoEntity } from "./entities/post.photo.entity";
import { SharedModule } from "../shared/shared.module";
import { DeleteFavoritePostUseCase } from "./application/use-cases/delete-favorite-post.use-case";
import { DeleteAllFavoritePostUseCase } from "./application/use-cases/delete-all-favorite-post.use-case";
import { AddFavoritePostUseCase } from "./application/use-cases/add-favorite-post.use-case";
import { UsersPostsController } from "./api/users.posts.controller";
import { UserEntity } from "../users/entities";
import { CommentsModule } from "../comments/comments.module";

const useCases = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  AddFavoritePostUseCase,
  DeleteAllFavoritePostUseCase,
  DeleteFavoritePostUseCase,
];
const adapters = [PostsRepository, PostsQueryRepository];

@Module({
  imports: [
    CommentsModule,
    CqrsModule,
    SharedModule,
    FilesModule,
    UsersModule,
    TypeOrmModule.forFeature([PostEntity, PostPhotoEntity, UserEntity]),
  ],
  providers: [...useCases, ...adapters],
  controllers: [PostsController, UsersPostsController],
  exports: [...adapters],
})
export class PostsModule {}
