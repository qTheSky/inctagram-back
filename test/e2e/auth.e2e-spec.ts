import { HttpStatus, INestApplication } from '@nestjs/common';
import { getAppAndCleanDB } from '../utils/get-app-and-clean-db';
import { cleanDb } from '../utils/clean-db';
import request from 'supertest';
import { registerModel } from '../models/register.model';
import { EmailsManager } from '../../src/modules/notification/application/emails.manager';

describe('auth controller', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await getAppAndCleanDB();
  });

  afterAll(() => {
    app.close();
  });

  describe('/registration', () => {
    beforeAll(async () => {
      await cleanDb({ app });
    });

    it('should register user', async function () {
      const emailsManager = await app.resolve(EmailsManager);

      const sendEmailMock = jest
        .spyOn(emailsManager, 'sendEmailConfirmationMessage')
        .mockImplementation(async () => {
          console.log('[Mock Email] Email sent.');
        });

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send(registerModel)
        .expect(HttpStatus.NO_CONTENT);
      expect(sendEmailMock).toHaveBeenCalled();
      sendEmailMock.mockRestore();
    });
  });
});
