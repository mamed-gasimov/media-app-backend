import { ProcessPromiseFunction } from 'bull';

import { IFollowerJobData } from '@follower/interfaces/follower.interface';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { followerWorker } from '@worker/follower.worker';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followers');
    this.processJob('addFollowerToDb', 5, followerWorker.addFollowerToDb as ProcessPromiseFunction<IBaseJobData>);
    // this.processJob(
    //   'removeFollowerFromDb',
    //   5,
    //   followerWorker.removeFollowerFromDB as ProcessPromiseFunction<IBaseJobData>
    // );
  }

  public addFollowerJob(name: string, data: IFollowerJobData) {
    this.addJob(name, data);
  }
}

export const followerQueue = new FollowerQueue();
