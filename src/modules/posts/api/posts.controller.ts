import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { CreatePostDto } from './dto/input/create-post.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostViewModel } from './dto/view/PostViewModel';
import { UpdatePostDto } from './dto/input/update-post.dto';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';
import { apiBadRequestResponse } from '../../../config/swagger/constants/api-bad-request-response/api-bad-request-response';
import { apiUnauthorizedResponse } from '../../../config/swagger/constants/api-unauthorized-response/api-unauthorized-response';
import { apiBody } from '../../../config/swagger/constants/api-body/api-body';
import { apiResponse } from '../../../config/swagger/constants/api-response/api-response';
import { apiNoContentResponse } from '../../../config/swagger/constants/api-response/api-no-content-response';
import { badRequestException } from '../../shared/utils/bad-request.exception';
import { CommentViewModel } from '../../../modules/comments/api/models/view/comment.view.model';
import { CreateCommentCommand } from '../../../modules/comments/application/useCases/create-comment.use-case';
import { CreateCommentModel } from '../../../modules/comments/api/models/input/create.comment.input.model';
import { BadRequestApiExample } from '../../../config/swagger/constants/api-bad-request-response/bad-request-schema-example';
import { commentViewModelExample } from '../../../config/swagger/constants/comment/comment-view-model-example';
import { CommentsQueryRepository } from '../../../modules/comments/infrastructure/comments.query.repository';
import { Paginated } from '../../../modules/shared/pagination/paginator';
import { PaginatorInputModel } from '../../../modules/shared/pagination/paginator.model';
import { getPaginatorExample } from '../../../config/swagger/get-paginator-example';
import { latinTranslateName } from '../../../modules/files/utils/latin-translate-name';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository,
    @Inject(forwardRef(() => CommentsQueryRepository))
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}

  @Post()
  @ApiOperation({ summary: 'create post' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody(apiBody(CreatePostDto))
  @ApiResponse(apiResponse('Returns created post', PostViewModel, 201))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @UseInterceptors(
    FilesInterceptor(
      'files' /*, 10, {
      fileFilter: (req: any, file: any, cb: any) => {
        file.originalname = latinTranslateName(file.originalname);
      },
    }*/
    )
  )
  async createPost(
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() dto: CreatePostDto,
    @CurrentUserId() currentUserId: string
  ): Promise<Array<PostViewModel>> {
    if (photos.length > 10) badRequestException('files', 'Too many photos');
    return await this.commandBus.execute(
      new CreatePostCommand({ ...dto, files: photos }, currentUserId)
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'update post' })
  @ApiBody(apiBody(UpdatePostDto))
  @ApiResponse(apiResponse('Returns updated post', PostViewModel))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse()
  @HttpCode(200)
  @Put(':postId')
  async updatePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostDto,
    @CurrentUserId() currentUserId: string
  ): Promise<PostViewModel> {
    return await this.commandBus.execute(
      new UpdatePostCommand(dto, currentUserId, postId)
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'delete post' })
  @ApiResponse(apiNoContentResponse)
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @HttpCode(204)
  @Delete(':postId')
  async deletePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUserId() currentUserId: string
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(currentUserId, postId));
  }

  @ApiOperation({ summary: 'get post' })
  @ApiResponse(apiResponse('get post by id', PostViewModel))
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
  @Get(':postId')
  @HttpCode(200)
  async getPost(
    @Param('postId', ParseUUIDPipe) postId: string
  ): Promise<PostViewModel> {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    return this.postsQueryRepository.buildResponsePosts(post);
  }

  @Get(':postId/comments')
  @ApiOperation({ summary: 'Returns comments for specified post' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      example: getPaginatorExample<CommentViewModel>(commentViewModelExample),
    },
  })
  @ApiNotFoundResponse({
    description: "If post for passed postId doesn't exist",
  })
  @UseGuards(JwtAuthGuard)
  async findCommentsOfPost(
    @Param('postId') postId: string,
    @Query() query: PaginatorInputModel,
    @CurrentUserId() currentUserId: string
  ): Promise<Paginated<CommentViewModel[]>> {
    const post = await this.postsQueryRepository.findPostById(postId);
    if (!post) throw new NotFoundException('Post doesnt exist');
    return await this.commentsQueryRepository.getComments(
      query,
      postId,
      currentUserId
    );
  }

  @Post('/:postId/comments')
  @ApiOperation({ summary: 'Create new comment' })
  @ApiParam({ name: 'postId', type: 'string' })
  @ApiResponse({ status: 201, schema: { example: commentViewModelExample } })
  @ApiBadRequestResponse({
    schema: BadRequestApiExample,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({
    description: "If post with specified id doesn't exists",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('postId') postId: string,
    @Body() createCommentModel: CreateCommentModel,
    @CurrentUserId() currentUserId: string
  ): Promise<CommentViewModel> {
    return this.commandBus.execute<CreateCommentCommand, CommentViewModel>(
      new CreateCommentCommand(
        postId,
        currentUserId,
        createCommentModel.content
      )
    );
  }
}
