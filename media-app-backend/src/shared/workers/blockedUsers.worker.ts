import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { IBlockedUserJobData } from '@blocked/interfaces/blockedUsers.interface';
import { blockUserService } from '@service/db/blockedUsers.service';

const log = config.createLogger('blockedUsersWorker');

class BlockedUsersWorker {
  async updateBlockUserInDb(job: Job<IBlockedUserJobData>, done: DoneCallback) {
    try {
      const { keyOne, keyTwo, type } = job.data;
      if (type === 'block') {
        await blockUserService.blockUser(keyOne, keyTwo);
      } else {
        await blockUserService.unblockUser(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const blockedUsersWorker = new BlockedUsersWorker();
