import { Module, forwardRef } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../shared/shared.module";
import { CommentsController } from "./api/comments.controller";
import { CommentsQueryRepository } from "./infrastructure/comments.query.repository";
import { CommentsRepository } from "./infrastructure/comments.repository";
import { CommentEntity } from "./entities/comment.entity";
import { CreateCommentUseCase } from "./application/useCases/create-comment.use-case";
import { DeleteCommentUseCase } from "./application/useCases/delete-comment.use-case";
import { UpdateCommentUseCase } from "./application/useCases/update-comment.use-case";
import { PostsModule } from "../posts/posts.module";
import { UsersModule } from "../users/users.module";
import { UpdateLikeStatusUseCase } from "./application/useCases/update-like-status-comment.use-case";
import { CommentLikeInfo } from "./entities/comment.like-info.entity";
import { AuthModule } from "../auth/auth.module";

const useCases = [
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateLikeStatusUseCase,
];
const adapters = [CommentsRepository, CommentsQueryRepository];

@Module({
  imports: [
    forwardRef(() => PostsModule),
    AuthModule,
    CqrsModule,
    SharedModule,
    UsersModule,
    TypeOrmModule.forFeature([CommentEntity, CommentLikeInfo]),
  ],
  providers: [...useCases, ...adapters],
  controllers: [CommentsController],
  exports: [...adapters],
})
export class CommentsModule {}
