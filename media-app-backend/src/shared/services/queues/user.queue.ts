import { ProcessPromiseFunction } from 'bull';

import { userWorker } from '@root/shared/workers/user.worker';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDb', 5, userWorker.addUserToDb as ProcessPromiseFunction<IBaseJobData>);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public addUserJob(name: string, data: any) {
    this.addJob(name, data);
  }
}

export const userQueue = new UserQueue();
