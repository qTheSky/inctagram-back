import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailAdapter {
  async sendEmail(email: string, subject: string, message: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'thesky946@gmail.com',
        pass: 'xweuvcjyxrilbycv',
      },
    });

    const info = await transport.sendMail({
      from: 'INCTOGRAM) <thesky946@gmail.com>',
      to: email,
      subject,
      html: message,
    });

    return info;
  }
}
