import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostViewModel } from './dto/view/PostViewModel';
import { AddFavoritePostCommand } from '../application/use-cases/add-favorite-post.use-case';
import { CurrentUserId } from '../../../modules/shared/decorators/current-user-id.decorator';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { DeleteFavoritePostCommand } from '../application/use-cases/delete-favorite-post.use-case';
import { DeleteAllFavoritePostCommand } from '../application/use-cases/delete-all-favorite-post.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/shared/guards/jwt-auth.guard';
import { apiUnauthorizedResponse } from '../../../config/swagger/constants/api-unauthorized-response/api-unauthorized-response';
import { apiBadRequestResponse } from '../../../config/swagger/constants/api-bad-request-response/api-bad-request-response';
import { apiResponse } from '../../../config/swagger/constants/api-response/api-response';
import { PaginatorInputModel } from '../../../modules/shared/pagination/paginator.model';
import { Paginated } from '../../../modules/shared/pagination/paginator';

@ApiTags('Users-posts')
@Controller('users-posts')
export class UsersPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}

  @ApiOperation({ summary: 'add favorite post' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse(apiResponse('Returns added post', PostViewModel, 200))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @Post(':postId')
  async addFavoritePost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string
  ): Promise<PostViewModel> {
    await this.commandBus.execute(new AddFavoritePostCommand(userId, postId));
    const post = await this.postsQueryRepository.findPostById(postId);
    return this.postsQueryRepository.buildResponsePosts(post);
  }

  @ApiOperation({ summary: 'get favorite post' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse(
    apiResponse('Returns user favorite post by id', PostViewModel, 200)
  )
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @Get(':postId')
  async getFavoritePost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string
  ): Promise<PostViewModel> {
    const post = await this.postsQueryRepository.findFavoritePostByUserId(
      userId,
      postId
    );
    if (!post) {
      throw new NotFoundException();
    }
    return this.postsQueryRepository.buildResponsePosts(post);
  }

  @ApiOperation({ summary: 'get all favorite posts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse(apiResponse('Returns all user posts', PostViewModel, 200))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @Get()
  async getAllFavoritePosts(
    @Query() query: PaginatorInputModel,
    @CurrentUserId() userId: string
  ): Promise<Paginated<PostViewModel[]>> {
    const posts = await this.postsQueryRepository.findAllFavoriteUserPosts(
      userId,
      query
    );
    return posts;
  }

  @ApiOperation({ summary: 'delete favorite post' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse(apiResponse('delete user post by id', PostViewModel, 204))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @Delete(':postId')
  async deleteFavoritePost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteFavoritePostCommand(userId, postId)
    );
  }

  @ApiOperation({ summary: 'delete favorite posts' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiResponse(apiResponse('delete all user posts', PostViewModel, 204))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @Delete()
  async deleteAllFavoritePosts(@CurrentUserId() userId: string): Promise<void> {
    await this.commandBus.execute(new DeleteAllFavoritePostCommand(userId));
  }
}
