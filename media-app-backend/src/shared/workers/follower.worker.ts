import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { followerService } from '@service/db/follower.sevice';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';

const log = config.createLogger('followerWorker');

class FollowerWorker {
  async addFollowerToDb(job: Job<IFollowerJobData>, done: DoneCallback) {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = job.data;
      await followerService.addFollowerToDb(keyOne!, keyTwo!, username!, followerDocumentId!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  // async removeFollowerFromDb(job: Job<IFollowerJobData>, done: DoneCallback) {
  //   try {
  //     const { keyOne, keyTwo } = job.data;
  //     await followerService.removeFollowerFromDb(keyOne, keyTwo);
  //     job.progress(100);
  //     done(null, job.data);
  //   } catch (error) {
  //     log.error(error);
  //     done(error as Error);
  //   }
  // }
}

export const followerWorker = new FollowerWorker();
