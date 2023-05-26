import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../infrastructure/comments.query.repository';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BadRequestApiExample } from '../../../config/swagger/constants/api-bad-request-response/bad-request-schema-example';
import { unauthorizedSwaggerMessage } from '../../../config/swagger/constants/api-unauthorized-response/unauthorized-swagger-message';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { DeleteCommentCommand } from '../application/useCases/delete-comment.use-case';
import { UpdateCommentCommand } from '../application/useCases/update-comment.use-case';
import { UpdateCommentModel } from './models/input/update.comment.input.model';
import { CommentViewModel } from './models/view/comment.view.model';
import { commentViewModelExample } from '../../../config/swagger/constants/comment/comment-view-model-example';
import { LikeInputModel } from './models/input/comment-like.model';
import { UpdateLikeStatusCommand } from '../application/useCases/update-like-status-comment.use-case';
import { Request } from 'express';
import { AuthService } from '../../../modules/auth/application/auth.service';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}

  @Put('/:commentId')
  @ApiOperation({ summary: 'Update existing comment by id with InputModel' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiBadRequestResponse({
    schema: BadRequestApiExample,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'If try edit the comment that is not your own',
  })
  @ApiNotFoundResponse({ description: 'If comment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateComment(
    @Param('commentId') commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() updateCommentModel: UpdateCommentModel
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(
        commentId,
        currentUserId,
        updateCommentModel.content
      )
    );
  }

  @Delete(':commentId')
  @ApiOperation({ summary: 'Delete specified comment by id' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @ApiForbiddenResponse({
    description: 'If try delete the comment that is not your own',
  })
  @ApiNotFoundResponse({ description: 'If comment not found' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUserId() currentUserId: string
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(commentId, currentUserId)
    );
  }

  @Get(':commentId')
  @ApiOperation({ summary: 'Return comment by id' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 200, schema: { example: commentViewModelExample } })
  @ApiNotFoundResponse({ description: 'Not Found' })
  async getCommentById(
    @Param('commentId') id: string,
    @Req() req: Request
  ): Promise<CommentViewModel> {
    const userId = this.authService.getUserIdByTokenOrThrow(
      req.cookies.refreshToken
    );
    const comment = await this.commentsQueryRepository.getCommentById(id);
    if (!comment) throw new NotFoundException('Comment doesnt exist');
    return this.commentsQueryRepository.buildResponseCurrentUserComment(
      comment,
      userId
    );
  }

  @ApiOperation({ summary: 'Update like status comment' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiBadRequestResponse({
    schema: BadRequestApiExample,
    description: 'If the inputModel has incorrect values',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @ApiForbiddenResponse({
  //   description: "If try edit the comment that is not your own",
  // })
  @ApiNotFoundResponse({ description: 'If comment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':commentId/like-status')
  async updateCommentLikeStatus(
    @CurrentUserId() currentUserId: string,
    @Param('commentId') commentId: string,
    @Body() { likeStatus }: LikeInputModel
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateLikeStatusCommand(commentId, likeStatus, currentUserId)
    );
  }
}
