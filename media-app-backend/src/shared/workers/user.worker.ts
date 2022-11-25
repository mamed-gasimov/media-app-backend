import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';

const log = config.createLogger('userWorker');

class UserWorker {
  async addUserToDb(job: Job, done: DoneCallback) {
    try {
      const value = job.data.value as IUserDocument;
      userService.addUserData(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker = new UserWorker();
