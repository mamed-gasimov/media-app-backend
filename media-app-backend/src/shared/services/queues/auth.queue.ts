import { ProcessPromiseFunction } from 'bull';

import { IAuthJob } from '@auth/interfaces/auth.interface';
import { authWorker } from '@root/shared/workers/auth.worker';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDb', 5, authWorker.addAuthUserToDb as ProcessPromiseFunction<IBaseJobData>);
  }

  public addAuthUserJob(name: string, data: IAuthJob) {
    this.addJob(name, data);
  }
}

export const authQueue = new AuthQueue();
