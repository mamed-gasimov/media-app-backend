import { ProcessPromiseFunction } from 'bull';

import { emailWorker } from '@worker/email.worker';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob(
      'forgotPasswordEmail',
      5,
      emailWorker.addNotificationEmail as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'commentsEmail',
      5,
      emailWorker.addNotificationEmail as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'followersEmail',
      5,
      emailWorker.addNotificationEmail as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'reactionsEmail',
      5,
      emailWorker.addNotificationEmail as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'directMessageEmail',
      5,
      emailWorker.addNotificationEmail as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'changePassword',
      5,
      emailWorker.addNotificationEmail as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addEmailJob(name: string, data: IEmailJob) {
    this.addJob(name, data);
  }
}

export const emailQueue = new EmailQueue();
