import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailRequest, EmailResponse, MailModuleOptions } from './interfaces';
import { MAIL_MODULE_OPTIONS } from './mail.constants';

@Injectable()
export class MailService {
  constructor(@Inject(MAIL_MODULE_OPTIONS) readonly options: MailModuleOptions) {}

  /**
   * Send new email via nodemailer using payload
   * @param {EmailRequest} emailObject creation payload
   * @return {Promise<EmailResponse>}
   */
  public async sendEmail(emailObject: EmailRequest): Promise<EmailResponse> {
    const response: EmailResponse = { status: 'success', error: null };
    try {
      await this.getTransporter().sendMail(emailObject);
    } catch (error) {
      response.status = 'failed';
      if (error.response) {
        response.error = error.response.body;
      } else {
        response.error = error.toString();
      }
    }

    return response;
  }

  private getTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.options.gmail,
        pass: this.options.password,
      },
    });
  }
}
