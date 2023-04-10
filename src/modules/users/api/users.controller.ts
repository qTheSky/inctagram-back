import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
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
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { userProfileExample } from '../../../swagger/schema/profile/user-profile-example';
import { unauthorizedSwaggerMessage } from '../../../swagger/constants/unauthorized-swagger-message';
import { UserProfileViewModel } from './dto/view/UserProfileViewModel';
import { BadRequestApiExample } from '../../../swagger/schema/bad-request-schema-example';
import { badRequestSwaggerMessage } from '../../../swagger/constants/bad-request-swagger-message';

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
    return this.usersProfilesRepository.getUserProfile(currentUserId);
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
    return this.usersProfilesRepository.getUserProfile(userId);
  }
}
