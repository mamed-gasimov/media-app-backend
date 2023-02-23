import { ProcessPromiseFunction } from 'bull';

import { userWorker } from '@worker/user.worker';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { IUserJob } from '@user/interfaces/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDb', 5, userWorker.addUserToDb as ProcessPromiseFunction<IBaseJobData>);
    this.processJob(
      'updateSocialLinksInDb',
      5,
      userWorker.updateSocialLinks as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'updateBasicInfoInDb',
      5,
      userWorker.updateUserInfo as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'updateNotificationSettings',
      5,
      userWorker.updateNotificationSettings as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addUserJob(name: string, data: IUserJob) {
    this.addJob(name, data);
  }
}

export const userQueue = new UserQueue();
