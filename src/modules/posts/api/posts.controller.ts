import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { CreatePostDto } from './dto/input/create-post.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { unauthorizedSwaggerMessage } from '../../../swagger/constants/unauthorized-swagger-message';
import { badRequestSwaggerMessage } from '../../../swagger/constants/bad-request-swagger-message';
import { BadRequestApiExample } from '../../../swagger/schema/bad-request-schema-example';
import { PostViewModel } from './dto/view/PostViewModel';
import { UpdatePostDto } from './dto/input/update-post.dto';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { PostsQueryRepository } from '../infrastructure/posts.query.repository';

@ApiBearerAuth()
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postsQueryRepository: PostsQueryRepository
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'create post' })
  @ApiBody({
    description: 'Example request body',
    type: CreatePostDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Returns created post',
    type: PostViewModel,
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedSwaggerMessage,
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async createPost(
    @UploadedFile() photo: Express.Multer.File,
    @Body() dto: CreatePostDto,
    @CurrentUserId() currentUserId: string
  ) {
    return await this.commandBus.execute(
      new CreatePostCommand({ ...dto, file: photo }, currentUserId)
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'update post' })
  @ApiParam({
    name: 'postId',
    required: true,
    type: String,
    description: 'Post identifier',
  })
  @ApiBody({
    description: 'Example request body',
    type: UpdatePostDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created post',
    type: PostViewModel,
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedSwaggerMessage,
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @HttpCode(200)
  @Put(':postId')
  async updatePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostDto,
    @CurrentUserId() currentUserId: string
  ) {
    return await this.commandBus.execute(
      new UpdatePostCommand(dto, currentUserId, postId)
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'delete post' })
  @ApiParam({
    name: 'postId',
    type: String,
    required: true,
    description: 'Post identifier',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedSwaggerMessage,
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @HttpCode(204)
  @Delete(':postId')
  async deletePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUserId() currentUserId: string
  ) {
    await this.commandBus.execute(new DeletePostCommand(currentUserId, postId));
  }

  @ApiOperation({ summary: 'get post' })
  @ApiParam({
    name: 'postId',
    type: String,
    required: true,
    description: 'Post identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns post by id',
    type: PostViewModel,
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedSwaggerMessage,
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
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
