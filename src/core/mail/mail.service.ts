import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    from: string,
    to: string,
    subject: string,
    text: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        from,
        subject,
        text,
      });
    } catch (error) {
      console.log({ error });
      throw new InternalServerErrorException(
        `Something went wrong please try again, Error:${JSON.stringify(error)}`,
      );
    }
  }
}
