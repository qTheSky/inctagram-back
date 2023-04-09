import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { EmailAdapter } from '../infrastructure/email.adapter';

@Injectable()
export class EmailsManager {
  constructor(private emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationMessage(user: UserEntity) {
    await this.emailAdapter.sendEmail(
      user.email,
      'email confirmation',
      ` <h1>Thank for your registration</h1>
                     <p>To finish registration please follow the link below:
                        <a href='https://localhost:3000/confirm-email?code=${user.emailConfirmation.confirmationCode}'>complete registration</a>
                        ${user.emailConfirmation.confirmationCode}
                      </p>`
    );
  }
  async sendPasswordRecoveryCode(userEmail: string, recoveryCode: string) {
    await this.emailAdapter.sendEmail(
      userEmail,
      'password recovery',
      ` <h1>Password recovery</h1>
                     <p>To finish password recovery please follow the link below:
                        <a href='https://localhost:3000/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
                        ${recoveryCode}
                      </p>`
    );
  }
}
