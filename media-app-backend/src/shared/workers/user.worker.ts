import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { IUserDocument, IUserJob } from '@user/interfaces/user.interface';

const log = config.createLogger('userWorker');

class UserWorker {
  async addUserToDb(job: Job<IUserJob>, done: DoneCallback) {
    try {
      const { value } = job.data;
      userService.addUserData(value as IUserDocument);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker = new UserWorker();
