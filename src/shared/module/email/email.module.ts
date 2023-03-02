import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'

import { EmailService } from '@shared/module/email/email.service'

import { ENV } from '@shared/constant/env.constant'

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ENV }),
    MailerModule.forRoot({
      transport: {
        sender: 'no-reply@advantex.com',
        host: process.env.SMTP_HOST,
        secure: true,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: '"Advantex" <noreply@advantex.com>',
      },
      template: {
        dir: join(__dirname, 'template'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: false,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
