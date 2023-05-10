import { Module, forwardRef } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SharedModule } from "../shared/shared.module";
import { CommentsController } from "./api/coments.controller";
import { CommentsQueryRepository } from "./infrastructure/comments.query.repository";
import { CommentsRepository } from "./infrastructure/comments.repository";
import { CommentEntity } from "./entities/comment.entity";
import { CreateCommentUseCase } from "./application/useCases/create-comment.use-case";
import { DeleteCommentUseCase } from "./application/useCases/delete-comment.use-case";
import { UpdateCommentUseCase } from "./application/useCases/update-comment.use-case";
import { PostsModule } from "../posts/posts.module";
import { UsersModule } from "../users/users.module";

const useCases = [
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
];
const adapters = [CommentsRepository, CommentsQueryRepository];

@Module({
  imports: [
    forwardRef(() => PostsModule),
    CqrsModule,
    SharedModule,
    UsersModule,
    TypeOrmModule.forFeature([CommentEntity]),
  ],
  providers: [...useCases, ...adapters],
  controllers: [CommentsController],
  exports: [...adapters],
})
export class CommentsModule {}
