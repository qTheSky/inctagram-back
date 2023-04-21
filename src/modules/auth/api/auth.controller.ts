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
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import {
  EmailConfirmDto,
  EmailResendModel,
  LoginDto,
  PasswordRecoveryModel,
  RegisterDto,
  UpdatePasswordModel,
} from './dto/input';
import {
  ConfirmEmailCommand,
  GetAuthUserDataCommand,
  LoginCommand,
  LogoutCommand,
  NewPasswordCommand,
  PasswordRecoveryCommand,
  RefreshTokenCommand,
  RegistrationCommand,
  RegistrationEmailResendingCommand,
} from '../application/use-cases';
import { LocalAuthGuard } from '../../shared/guards/local-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { tooManyRequestsMessage } from '../../../config/swagger/constants/too-many-requests-message';
import { AuthMeDto } from './dto/view/auth-me.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from '../../shared/guards/google-auth.guard';
import { GithubAuthGuard } from '../../shared/guards/github-auth.guard';
import { apiBadRequestResponse } from '../../../config/swagger/constants/api-bad-request-response/api-bad-request-response';
import { apiNoContentResponse } from '../../../config/swagger/constants/api-response/api-no-content-response';
import { SocialLoginCommand } from '../application/use-cases/social-login.use-case';
import { ConfigService } from '@nestjs/config';
import { apiBody } from '../../../config/swagger/constants/api-body/api-body';
import { apiResponse } from '../../../config/swagger/constants/api-response/api-response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private configService: ConfigService
  ) {}

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
  @ApiBadRequestResponse(apiBadRequestResponse)
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(1, 5) // 1 request per 5  seconds
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: RegisterDto): Promise<void> {
    await this.commandBus.execute(new RegistrationCommand(dto));
  }

  @Post('login')
  @ApiOperation({ summary: 'Try login user to the system' })
  @ApiBody(apiBody(LoginDto))
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).',
    schema: { example: { accessToken: 'string' } },
  })
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @ApiBadRequestResponse(apiBadRequestResponse)
  @ApiUnauthorizedResponse({ description: 'If the password or login is wrong' })
  @Throttle(1, 5) // 1 request per 5 seconds
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async localLogin(
    @Req() req,
    @Res({ passthrough: true }) res
  ): Promise<{ accessToken: string }> {
    return await this.loginOrRefreshToken(
      res,
      new LoginCommand(req.user, {
        ip: req.ip,
        deviceName: req.headers['user-agent'],
      })
    );
  }

  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirm registration.' })
  @ApiResponse({
    status: 204,
    description: 'Email was verified. Account was activated',
  })
  @ApiBadRequestResponse(apiBadRequestResponse)
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
    return await this.loginOrRefreshToken(
      res,
      new RefreshTokenCommand(req.cookies.refreshToken)
    );
  }

  @Post('logout')
  @ApiOperation({
    summary:
      'In cookie client must send correct refreshToken that will be revoked',
  })
  @ApiResponse(apiNoContentResponse)
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
  @ApiResponse(apiResponse('Success', AuthMeDto))
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
      'Input data is accepted.Email with confirmation code will be send ' +
      'to passed email address.Confirmation code should be inside link as query param,' +
      ' for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiBadRequestResponse(apiBadRequestResponse)
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  async resendEmailConfirmationCode(
    @Body() emailResendModel: EmailResendModel
  ): Promise<void> {
    await this.commandBus.execute<RegistrationEmailResendingCommand, void>(
      new RegistrationEmailResendingCommand(
        emailResendModel.email,
        emailResendModel.frontendLink
      )
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
  @ApiBadRequestResponse(apiBadRequestResponse)
  @ApiTooManyRequestsResponse({ description: tooManyRequestsMessage })
  @Throttle(5, 10)
  @HttpCode(204)
  async sendPasswordRecoveryCode(
    @Body() model: PasswordRecoveryModel
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(model.email, model.frontendLink)
    );
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

  @Get('google')
  @ApiOperation({ summary: 'Try login user to the system via google' })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).',
    schema: { example: { accessToken: 'string' } },
  })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('google/callback')
  // @Redirect('https://pornhub.com') //todo frontend url
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    return await this.loginOrRefreshToken(
      res,
      new SocialLoginCommand(req.user, {
        ip: req.ip,
        deviceName: req.headers['user-agent'],
      })
    );
  }

  @Get('github')
  @ApiOperation({ summary: 'Try login user to the system via github' })
  @ApiResponse({
    status: 200,
    description:
      'Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).',
    schema: { example: { accessToken: 'string' } },
  })
  @UseGuards(GithubAuthGuard)
  async githubAuth(): Promise<void> {
    return;
  }

  @ApiExcludeEndpoint()
  @Get('github/callback')
  //@Redirect('https://pornhub.com') //todo frontend url
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ accessToken: string }> {
    return await this.loginOrRefreshToken(
      res,
      new SocialLoginCommand(req.user, {
        ip: req.ip,
        deviceName: req.headers['user-agent'],
      })
    );
  }

  private async loginOrRefreshToken(
    res: Response,
    command: any
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      command
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      maxAge: 180 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });

    return {
      accessToken,
    };
  }
}
