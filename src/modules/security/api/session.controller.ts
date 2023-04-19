import { Controller, Delete, Get, HttpCode, Param, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../auth/application/auth.service';
import { DeleteSessionByDeviceIdCommand } from '../application/useCases/delete-session-by-device-id-use.case';
import { DeleteSessionsExceptCurrentCommand } from '../application/useCases/delete-sessions-except-current.use-case';
import { SessionsQueryRepository } from '../infrastructure/sessions.query.repository';
import { SessionViewModel } from './dto/view/SessionViewModel';
import { Request } from 'express';
import { deviceViewModelExample } from '../../../config/swagger/constants/device-view-model-example';

@ApiTags('SecurityDevices')
@Controller('security/devices')
export class SessionsController {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
    private authService: AuthService,
    private commandBus: CommandBus
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Returns all devices with active sessions for current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: { example: [deviceViewModelExample] },
  })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  async getSessionsOfUser(@Req() req: Request): Promise<SessionViewModel[]> {
    const userId = this.authService.getUserIdByTokenOrThrow(
      req.cookies.refreshToken
    );
    const sessions = await this.sessionsQueryRepository.findAllSessionsOfUser(
      userId
    );
    return sessions.map((session) =>
      this.sessionsQueryRepository.buildResponseSession(session)
    );
  }

  @Delete()
  @ApiOperation({
    summary: "Terminate all other (exclude current) device's sessions",
  })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @HttpCode(204)
  async deleteSessionExceptCurrent(@Req() req: Request): Promise<void> {
    await this.commandBus.execute<DeleteSessionsExceptCurrentCommand, void>(
      new DeleteSessionsExceptCurrentCommand(req.cookies.refreshToken)
    );
  }

  @Delete(':deviceId')
  @ApiOperation({ summary: 'Terminate specified device session' })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @ApiForbiddenResponse({
    description: 'If try to delete the deviceId of other user',
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @HttpCode(204)
  async deleteSessionByDeviceId(
    @Param('deviceId') deviceId: string,
    @Req() req: Request
  ): Promise<void> {
    await this.commandBus.execute<DeleteSessionByDeviceIdCommand, void>(
      new DeleteSessionByDeviceIdCommand(req.cookies.refreshToken, deviceId)
    );
  }
}
