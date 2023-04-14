import {
  Body,
  Controller,
  Post,
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
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { unauthorizedSwaggerMessage } from '../../../swagger/constants/unauthorized-swagger-message';
import { badRequestSwaggerMessage } from '../../../swagger/constants/bad-request-swagger-message';
import { BadRequestApiExample } from '../../../swagger/schema/bad-request-schema-example';
import { PostViewModel } from './dto/view/PostViewModel';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'create post' })
  @ApiBody({
    description: 'Example request body (all fields not required)',
    type: CreatePostDto,
  })
  @ApiResponse({
    status: 201,
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
}
