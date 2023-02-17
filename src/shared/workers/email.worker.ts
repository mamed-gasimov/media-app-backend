import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { mailTransport } from '@service/emails/mail.transport';
import { IEmailJob } from '@user/interfaces/user.interface';

const log = config.createLogger('emailworker');

class EmailWorker {
  async addNotificationEmail(job: Job<IEmailJob>, done: DoneCallback) {
    try {
      const { template, receiverEmail, subject } = job.data;
      await mailTransport.sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker = new EmailWorker();
