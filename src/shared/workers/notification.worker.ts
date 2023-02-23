import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { notificationService } from '@service/db/notification.service';
import { INotificationJobData } from '@notification/interfaces/notification.interface';

const log = config.createLogger('notificationWorker');

class NotificationWorker {
  async updateNotification(job: Job<INotificationJobData>, done: DoneCallback) {
    try {
      const { key } = job.data;
      await notificationService.updateNotification(key!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deleteNotification(job: Job<INotificationJobData>, done: DoneCallback) {
    try {
      const { key } = job.data;
      await notificationService.deleteNotification(key!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const notificationWorker = new NotificationWorker();
