import { ProcessPromiseFunction } from 'bull';

import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { commentWorker } from '@worker/comment.worker';
import { ICommentJob } from '@comment/interfaces/comments.interface';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comments');
    this.processJob('addPostCommentToDb', 5, commentWorker.savePostCommentToDb as ProcessPromiseFunction<IBaseJobData>);
  }

  public addPostCommentJob(name: string, data: ICommentJob) {
    this.addJob(name, data);
  }
}

export const commentQueue = new CommentQueue();
