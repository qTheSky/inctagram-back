import {
  Body,
  Controller,
  Get,
  NotFoundException,
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
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserProfileViewModel } from './dto/view/UserProfileViewModel';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadUserAvatarCommand } from '../application/use-cases/upload-user-avatar.use-case';
import { fileSchemaExample } from '../../../swagger/constants/file-schema-example';
import { apiBody } from '../../../swagger/constants/api-body/api-body';
import { apiBadRequestResponse } from '../../../swagger/constants/api-bad-request-response/api-bad-request-response';
import { apiUnauthorizedResponse } from '../../../swagger/constants/api-unauthorized-response/api-unauthorized-response';
import { apiResponse } from '../../../swagger/constants/api-response/api-response';
import { apiNotFoundResponseMessage } from '../../../swagger/constants/api-not-found-response/api-not-found-response-message';

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
  @ApiResponse(apiResponse('Returns updated profile', UserProfileViewModel))
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
  @ApiResponse(apiResponse('Returns user profile', UserProfileViewModel))
  @ApiNotFoundResponse(apiNotFoundResponseMessage)
  async getUserProfile(
    @Param('userId') userId: string
  ): Promise<UserProfileViewModel> {
    const profile = await this.usersProfilesRepository.getUserProfile(userId);
    if (!profile) throw new NotFoundException('Profile not found');
    return this.usersProfilesRepository.buildProfileViewModel(profile);
  }

  @Post('avatar')
  @ApiOperation({
    summary: 'Upload user avatar (1mb)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: fileSchemaExample })
  @ApiResponse(apiResponse('Returns user profile', UserProfileViewModel))
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
