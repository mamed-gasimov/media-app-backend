import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionService } from '@service/db/reaction.service';

const log = config.createLogger('reactionWorker');

class ReactionWorker {
  async saveReactionToDb(job: Job<IReactionJob>, done: DoneCallback) {
    try {
      const { data } = job;
      await reactionService.addReactionDataToDb(data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeReactionFromDb(job: Job<IReactionJob>, done: DoneCallback) {
    try {
      const { data } = job;
      await reactionService.removeReactionDataFromDB(data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const reactionWorker = new ReactionWorker();
