import { ProcessPromiseFunction } from 'bull';

import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { notificationWorker } from '@worker/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notifications');
    this.processJob(
      'updateNotification',
      5,
      notificationWorker.updateNotification as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'deleteNotification',
      5,
      notificationWorker.deleteNotification as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addNotificationJob(name: string, data: INotificationJobData) {
    this.addJob(name, data);
  }
}

export const notificationQueue = new NotificationQueue();
