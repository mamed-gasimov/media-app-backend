import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { ICommentJob } from '@comment/interfaces/comments.interface';
import { commentService } from '@service/db/comment.service';

const log = config.createLogger('commentWorker');

class CommentWorker {
  async savePostCommentToDb(job: Job<ICommentJob>, done: DoneCallback) {
    try {
      const { data } = job;
      await commentService.addPostCommentToDb(data);
      job.progress(100);
      done(null, data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const commentWorker = new CommentWorker();
