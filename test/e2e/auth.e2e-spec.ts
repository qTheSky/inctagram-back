import { HttpStatus, INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from '../utils/get-app-and-clean-db';
import { cleanDb } from '../utils/clean-db';
import request from 'supertest';
import { registerModel } from '../models/register.model';
import { EmailsManager } from '../../src/modules/notification/application/emails.manager';
import {
  EmailConfirmDto,
  EmailResendModel,
  LoginDto,
  PasswordRecoveryModel,
  UpdatePasswordModel,
} from '../../src/modules/auth/api/dto/input';
import { AuthMeDto } from '../../src/modules/auth/api/dto/view/auth-me.dto';

describe('auth controller', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  afterAll(() => {
    app.close();
  });

  describe('registration flow with emails and recovery password', () => {
    beforeAll(async () => {
      await cleanDb({ app });
    });

    let emailConfirmationCode: string;
    it('should register user', async function () {
      const emailsManager = await app.resolve(EmailsManager);
      const sendEmailMock = jest.spyOn(
        emailsManager,
        'sendEmailConfirmationMessage'
      );

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send(registerModel)
        .expect(HttpStatus.NO_CONTENT);

      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      sendEmailMock.mockRestore();
    });
    it('should resend confirmation email', async function () {
      const emailsManager = await app.resolve(EmailsManager);
      const sendEmailMock = jest
        .spyOn(emailsManager, 'sendEmailConfirmationMessage')
        .mockImplementation(async (email, code) => {
          emailConfirmationCode = code;
        });
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: registerModel.email,
          frontendLink: 'no matter',
        } as EmailResendModel);

      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      sendEmailMock.mockRestore();
    });
    it('registered user can`t log in because he didnt confirm email', async function () {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: registerModel.email,
          password: registerModel.password,
        } as LoginDto)
        .expect(401);
    });
    it('user should confirm email', async function () {
      await request(app.getHttpServer())
        .post('/auth/confirm-email')
        .send({
          code: emailConfirmationCode,
        } as EmailConfirmDto)
        .expect(204);
    });
    let accessToken: string;
    it('confirmed user should log-in, get accessToken and refresh token in cookie', async function () {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: registerModel.email,
          password: registerModel.password,
        } as LoginDto)
        .expect(200)
        .then(({ body, headers }) => {
          accessToken = body.accessToken;
          expect(body).toEqual({ accessToken: expect.any(String) });
          expect(headers['set-cookie'][0]).toEqual(
            expect.stringContaining('refreshToken=')
          );
        });
    });
    it('should get information about user (authme)', async function () {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('authorization', `bearer ${accessToken}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            email: registerModel.email,
            userId: expect.any(String),
            login: registerModel.login,
          } as AuthMeDto);
        });
    });
    let passwordRecoveryCode: string;
    it('should send reset password email', async function () {
      const emailsManager = await app.resolve(EmailsManager);
      const sendEmailMock = jest
        .spyOn(emailsManager, 'sendPasswordRecoveryCode')
        .mockImplementation(async (email, code) => {
          passwordRecoveryCode = code;
        });

      await request(app.getHttpServer())
        .post('/auth/password-recovery')
        .send({
          frontendLink: 'no matter',
          email: registerModel.email,
        } as PasswordRecoveryModel);
      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      sendEmailMock.mockRestore();
    });
    it('should set new password and login with new pass', async function () {
      const newPassword = '777&&as8qQ?^';
      await request(app.getHttpServer())
        .post('/auth/new-password')
        .send({
          newPassword,
          recoveryCode: passwordRecoveryCode,
        } as UpdatePasswordModel)
        .expect(204);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: registerModel.email,
          password: newPassword,
        } as LoginDto)
        .expect(200);
    });
  });
});
