import { DoneCallback, Job } from 'bull';

import { IPostDocument, IPostJobData } from '@post/interfaces/post.interface';
import { config } from '@root/config';
import { postService } from '@service/db/post.service';

const log = config.createLogger('postWorker');

class PostWorker {
  async savePostToDb(job: Job<IPostJobData>, done: DoneCallback) {
    try {
      const { key, value } = job.data;
      await postService.addPostToDb(`${key}`, value as IPostDocument);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker = new PostWorker();
