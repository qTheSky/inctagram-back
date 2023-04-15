import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '../infrastructure/email.adapter';

@Injectable()
export class EmailsManager {
  constructor(private emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationMessage(
    email: string,
    confirmationCode: string,
    frontendLink: string
  ) {
    await this.emailAdapter.sendEmail(
      email,
      'email confirmation',
      ` <h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                        <a href='${frontendLink}?code=${confirmationCode}'>complete registration</a>
                        ${confirmationCode}
                      </p>`
    );
  }
  async sendPasswordRecoveryCode(
    userEmail: string,
    recoveryCode: string,
    frontendLink: string
  ) {
    await this.emailAdapter.sendEmail(
      userEmail,
      'password recovery',
      ` <h1>Password recovery</h1>
                     <p>To finish password recovery please follow the link below:
                        <a href='${frontendLink}?recoveryCode=${recoveryCode}'>recovery password</a>
                        ${recoveryCode}
                      </p>`
    );
  }
}
