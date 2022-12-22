import { ProcessPromiseFunction } from 'bull';

import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { blockedUsersWorker } from '@worker/blockedUsers.worker';
import { IBlockedUserJobData } from '@blocked/interfaces/blockedUsers.interface';

class BlockedUsersQueue extends BaseQueue {
  constructor() {
    super('blockedUsers');
    this.processJob(
      'addBlockedUserToDb',
      5,
      blockedUsersWorker.updateBlockUserInDb as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob(
      'removeBlockedUserFromDb',
      5,
      blockedUsersWorker.updateBlockUserInDb as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addBlockedUsersJob(name: string, data: IBlockedUserJobData) {
    this.addJob(name, data);
  }
}

export const blockedUsersQueue = new BlockedUsersQueue();
