import { htmlToText } from 'html-to-text';
import nodemailer from 'nodemailer';
import path from 'path';
import pug from 'pug';

import { emailConfig, NODE_ENV } from '@/config';
import { IUser } from '@/models/userModel';
import { IUserV2 } from '@/models/userV2Model';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (
      !emailConfig.EMAIL_HOST ||
      !emailConfig.EMAIL_PORT ||
      !emailConfig.EMAIL_USERNAME ||
      !emailConfig.EMAIL_PASSWORD
    ) {
      throw new Error('Missing email configuration environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.EMAIL_HOST,
      port: parseInt(emailConfig.EMAIL_PORT, 10),
      auth: {
        user: emailConfig.EMAIL_USERNAME,
        pass: emailConfig.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Thanaphon Phumthan <${emailConfig.GMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email: ${error}`);
    throw error;
  }
};

export default class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;

  constructor(user: IUser | IUserV2, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Thanaphon Phumthan <${emailConfig.EMAIL_FROM}>`;
  }

  private newTransport() {
    if (NODE_ENV !== 'development') {
      return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: emailConfig.GMAIL_USERNAME,
          pass: emailConfig.GMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailConfig.GMAIL_USERNAME,
        pass: emailConfig.GMAIL_PASSWORD,
      },
    });

    return nodemailer.createTransport({
      host: emailConfig.EMAIL_HOST,
      port: parseInt(emailConfig.EMAIL_PORT!, 10),
      auth: {
        user: emailConfig.EMAIL_USERNAME,
        pass: emailConfig.EMAIL_PASSWORD,
      },
    });
  }

  private async send(template: string, subject: string) {
    // 1) Render HTML from Pug template
    const html = pug.renderFile(
      path.resolve(__dirname, '..', 'views', 'email', `${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // 2) Define email options using nodemailer.SendMailOptions
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes',
    );
  }
}
