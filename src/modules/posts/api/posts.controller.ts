import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { CreatePostDto } from './dto/input/create-post.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
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

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository
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
      limits: {
        fileSize: 1024 * 1024,
      },
    }*/
    )
  )
  async createPost(
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() dto: CreatePostDto,
    @CurrentUserId() currentUserId: string
  ): Promise<Array<PostViewModel>> {
    if (photos.length > 10) {
      throw new BadRequestException([
        {
          message: 'Many photos',
          field: 'files',
        },
      ]);
    }
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
}
