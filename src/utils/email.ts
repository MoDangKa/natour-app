import { htmlToText } from 'html-to-text';
import nodemailer from 'nodemailer';
import path from 'path';
import pug from 'pug';

import {
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
  GMAIL_USERNAME,
  NODE_ENV,
} from '@/config';
import { IUser } from '@/models/userModel';
import { IUserV2 } from '@/models/userV2Model';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USERNAME || !EMAIL_PASSWORD) {
      throw new Error('Missing email configuration environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT, 10),
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Thanaphon Phumthan <${GMAIL_USERNAME}>`,
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
    this.from = `Thanaphon Phumthan <${EMAIL_FROM}>`;
  }

  private newTransport() {
    if (NODE_ENV === 'production') {
      // Production transport handling e.g., SendGrid
      // return nodemailer.createTransport({...});
    }

    return nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT!, 10),
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
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
}
