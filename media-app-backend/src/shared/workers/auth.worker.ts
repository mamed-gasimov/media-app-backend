import { DoneCallback, Job } from 'bull';

import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';

const log = config.createLogger('authWorker');

class AuthWorker {
  async addAuthUserToDb(job: Job, done: DoneCallback) {
    try {
      const value = job.data.value as IAuthDocument;
      await authService.createAuthUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const authWorker = new AuthWorker();
