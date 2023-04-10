import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterDto } from './dto/input/register.dto';
import { RegistrationCommand } from '../application/use-cases/registration.use-case';
import { LocalAuthGuard } from '../../shared/guards/local-auth.guard';
import { LoginCommand } from '../application/use-cases/login.use-case';
import { EmailConfirmDto } from './dto/input/email-confirm.dto';
import { ConfirmEmailCommand } from '../application/use-cases/confirm-email.use-case';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { tooManyRequestsMessage } from '../../../swagger/constants/too-many-requests-message';
import { BadRequestApiExample } from '../../../swagger/schema/bad-request-schema-example';
import { LoginDto } from './dto/input/login.dto';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';
import { LogoutCommand } from '../application/use-cases/logout.use-case';
import { AuthMeDto } from './dto/view/auth-me.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { GetAuthUserDataCommand } from '../application/use-cases/get-auth-user-data.use-case';
import { badRequestSwaggerMessage } from '../../../swagger/constants/bad-request-swagger-message';
import {
  NewPasswordCommand,
  PasswordRecoveryCommand,
  RegistrationEmailResendingCommand,
} from '../application/use-cases';
import {
  EmailResendModel,
  PasswordRecoveryModel,
  UpdatePasswordModel,
} from './dto/input';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('registration')
  @ApiOperation({
    summary:
      'Registration in the system. Email with confirmation code will be send to passed email address.',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted. Email with confirmation code will be send to passed email address',
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(1, 5) // 1 request per 5 seconds
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegisterDto): Promise<void> {
    await this.commandBus.execute(new RegistrationCommand(dto));
  }

  @Post('login')
  @ApiOperation({ summary: 'Try login user to the system' })
  @ApiBody({ description: 'Example request body', type: LoginDto })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).',
    schema: { example: { accessToken: 'string' } },
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @ApiUnauthorizedResponse({ description: 'If the password or login is wrong' })
  @Throttle(1, 5) // 1 request per 5 seconds
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req,
    @Res({ passthrough: true }) res
  ): Promise<{ accessToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute(
      new LoginCommand(req.user, req.ip, req.headers['user-agent'])
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //todo => if developing secure false otherwise true
      maxAge: 180 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });

    return { accessToken };
  }

  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirm registration.' })
  @ApiResponse({
    status: 204,
    description: 'Email was verified. Account was activated',
  })
  @ApiBadRequestResponse({
    description: badRequestSwaggerMessage,
    schema: BadRequestApiExample,
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle(1, 5) // 1 request per 5 seconds
  async confirmUserEmail(@Body() dto: EmailConfirmDto): Promise<void> {
    await this.commandBus.execute(new ConfirmEmailCommand(dto.code));
  }

  @Post('refresh-token')
  @ApiOperation({
    summary:
      'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing). ',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 8 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30days).',
    schema: { example: { accessToken: 'string' } },
  })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute(
      new RefreshTokenCommand(req.cookies.refreshToken)
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, //todo => if developing secure false otherwise true
      maxAge: 180 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });

    return { accessToken };
  }

  @Post('logout')
  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @ApiUnauthorizedResponse({
    description:
      'If the JWT refreshToken inside cookie is missing, expired or incorrect',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<void> {
    await this.commandBus.execute(new LogoutCommand(req.cookies.refreshToken));
    res.clearCookie('refreshToken');
  }

  @Get('me')
  @ApiOperation({ summary: 'Get information about current user' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      example: {
        email: 'string',
        userName: 'string',
        userId: 'string',
      } as AuthMeDto,
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAuthUserData(
    @CurrentUserId() currentUserId: string
  ): Promise<AuthMeDto> {
    return this.commandBus.execute(new GetAuthUserDataCommand(currentUserId));
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Resend confirmation registration Email if user exists',
  })
  @ApiResponse({
    status: 204,
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiBadRequestResponse({
    description: 'If the inputModel has incorrect values',
    schema: BadRequestApiExample,
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  async resendEmailConfirmationCode(
    @Body() emailResendModel: EmailResendModel
  ): Promise<void> {
    await this.commandBus.execute<RegistrationEmailResendingCommand, void>(
      new RegistrationEmailResendingCommand(emailResendModel.email)
    );
  }

  @Post('password-recovery')
  @ApiOperation({
    summary:
      'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
  })
  @ApiResponse({
    status: 204,
    description:
      "Even if current email is not registered (for prevent user's email detection)",
  })
  @ApiBadRequestResponse({
    description:
      'If the inputModel has invalid email (for example 222^gmail.com)',
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  @HttpCode(204)
  async sendPasswordRecoveryCode(
    @Body() model: PasswordRecoveryModel
  ): Promise<void> {
    await this.commandBus.execute(new PasswordRecoveryCommand(model.email));
  }

  @Post('new-password')
  @ApiOperation({ summary: 'Confirm password recovery' })
  @ApiResponse({
    status: 204,
    description: 'If code is valid and new password is accepted',
  })
  @ApiForbiddenResponse({ description: 'If code is wrong' })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @ApiNotFoundResponse({ description: 'If user with this code doesnt exist' })
  @Throttle(5, 10)
  @HttpCode(204)
  async updateUserPassword(
    @Body() { newPassword, recoveryCode }: UpdatePasswordModel
  ): Promise<void> {
    await this.commandBus.execute(
      new NewPasswordCommand(newPassword, recoveryCode)
    );
  }
}
