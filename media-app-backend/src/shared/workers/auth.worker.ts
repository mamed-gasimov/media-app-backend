import { DoneCallback, Job } from 'bull';

import { IAuthDocument, IAuthJob } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';

const log = config.createLogger('authWorker');

class AuthWorker {
  async addAuthUserToDb(job: Job<IAuthJob>, done: DoneCallback) {
    try {
      const { value } = job.data;
      await authService.createAuthUser(value as IAuthDocument);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const authWorker = new AuthWorker();
