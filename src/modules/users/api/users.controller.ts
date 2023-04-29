import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
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
import { fileSchemaExample } from '../../../config/swagger/constants/file-schema-example';
import { apiBody } from '../../../config/swagger/constants/api-body/api-body';
import { apiBadRequestResponse } from '../../../config/swagger/constants/api-bad-request-response/api-bad-request-response';
import { apiUnauthorizedResponse } from '../../../config/swagger/constants/api-unauthorized-response/api-unauthorized-response';
import { apiResponse } from '../../../config/swagger/constants/api-response/api-response';
import { apiNotFoundResponseMessage } from '../../../config/swagger/constants/api-not-found-response/api-not-found-response-message';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { SubscribeToUserCommand } from '../application/use-cases/subscribe-to-user.use-case';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersProfilesRepository: UsersProfilesRepository,
    private readonly commandBus: CommandBus,
    @InjectRedis() private readonly redis: Redis
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
    const updatedProfile = await this.commandBus.execute(
      new UpdateProfileCommand(currentUserId, dto)
    );
    const profileViewModel =
      this.usersProfilesRepository.buildProfileViewModel(updatedProfile);
    await this.redis.del(`profile${currentUserId}`);
    await this.redis.set(
      `profile${currentUserId}`,
      JSON.stringify(profileViewModel),
      'EX',
      60 * 10 //10 min
    );
    return profileViewModel;
  }

  @Get(':userId/profile')
  @ApiOperation({ summary: 'Get user profile by id of user' })
  @ApiResponse(apiResponse('Returns user profile', UserProfileViewModel))
  @ApiNotFoundResponse(apiNotFoundResponseMessage)
  async getUserProfile(
    @Param('userId') userId: string
  ): Promise<UserProfileViewModel> {
    const cachedProfile = await this.redis.get(`profile${userId}`);
    if (cachedProfile) return JSON.parse(cachedProfile);
    const profile = await this.usersProfilesRepository.findOne({ userId });
    if (!profile) throw new NotFoundException('Profile not found');
    const profileViewModel =
      await this.usersProfilesRepository.buildProfileViewModel(profile);
    await this.redis.set(
      `profile${userId}`,
      JSON.stringify(profileViewModel),
      'EX',
      60 * 10 //10 min
    );
    return profileViewModel;
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar (1mb)' })
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

  @Patch(':userId/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to user or unsubscribe' })
  @ApiResponse({
    description: 'true if subscribed. false if unsubscribed',
    type: Boolean,
    status: 200,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse(apiUnauthorizedResponse)
  async subscribeToUser(
    @CurrentUserId() currentUserId: string,
    @Param('userId') userIdForSubscribe: string
  ): Promise<boolean> {
    return this.commandBus.execute(
      new SubscribeToUserCommand(userIdForSubscribe, currentUserId)
    );
  }
}
