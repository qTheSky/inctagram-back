import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentEntity } from "../entities/comment.entity";
import { CommentViewModel } from "../api/models/view/comment.view.model";
import { Paginated } from "../../../modules/shared/pagination/paginator";
import { PaginatorInputModel } from "../../../modules/shared/pagination/paginator.model";
import { orderSort } from "../../../modules/shared/pagination/create.order";

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private commentsQueryRepository: Repository<CommentEntity>
  ) {}

  async buildResponseCurrentUserComment(
    commentUser: CommentEntity,
    userId: string
  ): Promise<CommentViewModel> {
    const comment = await this.commentsQueryRepository.findOne({
      where: { id: commentUser.id, userId: userId },
    });
    if (!comment) {
      throw new ForbiddenException();
    }
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.user.id,
        userLogin: comment.user.login,
      },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  buildResponseComment(comment: CommentEntity): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.user.id,
        userLogin: comment.user.login,
      },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async getCommentById(commentId: string): Promise<CommentEntity> {
    return await this.commentsQueryRepository.findOne({
      where: { id: commentId },
      relations: { post: true, user: true },
    });
  }

  async getComments(
    query: PaginatorInputModel,
    postId: string,
  ): Promise<Paginated<CommentViewModel[]>> {
    const order = orderSort(query.sort);
    const page = query.pageNumber;
    const size = query.pageSize;
    const skip: number = (page - 1) * page;

    const [items, totalCount] = await this.commentsQueryRepository.findAndCount(
      {
        where: { postId: postId },
        relations: ["user", "post"],
        take: size,
        skip,
        order,
      }
    );



    const paginatedComments = Paginated.getPaginated<CommentViewModel[]>({
      items: items.map((comment) => this.buildResponseComment(comment)),
      page: page,
      size: size,
      count: totalCount,
    });

    return paginatedComments;
  }
}
