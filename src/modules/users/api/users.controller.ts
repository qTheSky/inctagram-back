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
import { UsersProfilesRepository } from '../infrastructure';
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
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { userProfileExample } from '../../../swagger/schema/profile/user-profile-example';
import { UserProfileViewModel } from './dto/view/UserProfileViewModel';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadUserAvatarCommand } from '../application/use-cases/upload-user-avatar.use-case';
import { fileSchemaExample } from '../../../swagger/schema/file-schema-example';
import { apiBody } from '../../../swagger/constants/api-body/api-body';
import { apiBadRequestResponse } from '../../../swagger/constants/api-bad-request-response/api-bad-request-response';
import { apiUnauthorizedResponse } from '../../../swagger/constants/api-unauthorized-response/api-unauthorized-response';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersProfilesRepository: UsersProfilesRepository,
    private readonly commandBus: CommandBus
  ) {}

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody(apiBody(UserProfileDto))
  @ApiResponse({
    status: 200,
    description: 'Returns updated profile',
    schema: { example: userProfileExample },
  })
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  @ApiBadRequestResponse(apiBadRequestResponse)
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
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  async getUserProfile(
    @Param('userId') userId: string
  ): Promise<UserProfileViewModel> {
    const profile = await this.usersProfilesRepository.getUserProfile(userId);
    return this.usersProfilesRepository.buildProfileViewModel(profile);
  }

  @Post('avatar')
  @ApiOperation({
    summary: 'Upload user avatar (1mb)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: fileSchemaExample })
  @ApiResponse({
    status: 201,
    description: 'Uploaded image information object',
    schema: { example: userProfileExample },
  })
  @ApiBadRequestResponse(apiBadRequestResponse)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
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
