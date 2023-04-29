import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailAdapter {
  async sendEmail(email: string, subject: string, message: string) {
    // const transport = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'thesky946@gmail.com',
    //     pass: 'xweuvcjyxrilbycv',
    //   },
    // });

    const transport = nodemailer.createTransport({
      service: 'yandex',
      auth: {
        user: 'smirnov.mic@yandex.ru',
        pass: 'rlxgegvlikidlvhm',
      },
    });

    const info = await transport.sendMail({
      from: 'INCTOGRAM) <smirnov.mic@yandex.ru>',
      to: email,
      subject,
      html: message,
    });

    return info;
  }
}
