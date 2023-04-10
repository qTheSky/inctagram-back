import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersProfilesRepository } from '../infrastructure/users.profiles.repository';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { UserProfileDto } from './dto/input/user-profile.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateProfileCommand } from '../application/use-cases/update-profile.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { userProfileExample } from '../../../swagger/schema/profile/user-profile-example';
import { unauthorizedSwaggerMessage } from '../../../swagger/constants/unauthorized-swagger-message';
import { UserProfileViewModel } from './dto/view/UserProfileViewModel';
import { BadRequestApiExample } from '../../../swagger/schema/bad-request-schema-example';
import { badRequestSwaggerMessage } from '../../../swagger/constants/bad-request-swagger-message';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadUserAvatarCommand } from '../application/use-cases/upload-user-avatar.use-case';
import { fileSchemaExample } from '../../../swagger/schema/file-schema-example';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersProfilesRepository: UsersProfilesRepository,
    private readonly commandBus: CommandBus
  ) {}

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    description: 'Example request body (all fields not required)',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns updated profile',
    schema: { example: userProfileExample },
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedSwaggerMessage,
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @CurrentUserId() currentUserId: string,
    @Body() dto: UserProfileDto
  ): Promise<UserProfileViewModel> {
    await this.commandBus.execute(new UpdateProfileCommand(currentUserId, dto));
    const updatedProfile = await this.usersProfilesRepository.getUserProfile(
      currentUserId
    );
    return this.usersProfilesRepository.buildProfileViewModel(updatedProfile);
  }

  @Get(':userId/profile')
  @ApiOperation({ summary: 'Get user profile by id of user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile',
    schema: { example: userProfileExample },
  })
  @ApiUnauthorizedResponse({
    description: unauthorizedSwaggerMessage,
  })
  async getUserProfile(
    @Param('userId') userId: string
  ): Promise<UserProfileViewModel> {
    const profile = await this.usersProfilesRepository.getUserProfile(userId);
    return this.usersProfilesRepository.buildProfileViewModel(profile);
  }

  @Post('avatar')
  @ApiOperation({
    summary: 'Upload user avatar 512x512 (1mb)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: fileSchemaExample })
  @ApiResponse({
    status: 201,
    description: 'Uploaded image information object',
    schema: { example: userProfileExample },
  })
  @ApiBadRequestResponse({
    description: 'If file format is incorrect',
    schema: BadRequestApiExample,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: unauthorizedSwaggerMessage })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMainBlogImage(
    @UploadedFile() avatar: Express.Multer.File,
    @CurrentUserId() currentUserId: string
  ): Promise<UserProfileViewModel> {
    return this.commandBus.execute(
      new UploadUserAvatarCommand(avatar, currentUserId)
    );
  }
}
