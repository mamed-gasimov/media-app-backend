import sendGridMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

import { BadRequestError } from '@global/helpers/errorHandler';
import { config } from '@root/config';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log = config.createLogger('mailOptions');

sendGridMail.setApiKey(config.SENDGRID_API_KEY as string);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string) {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body);
    } else if (config.NODE_ENV === 'production') {
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!,
      },
    });

    const mailOptions: IMailOptions = {
      from: `Media App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    };

    try {
      await transporter.sendMail(mailOptions);
      log.info('Development email sent successfully.');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string) {
    const mailOptions: IMailOptions = {
      from: `Media App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email sent successfully.');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport = new MailTransport();
