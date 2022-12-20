import { ProcessPromiseFunction } from 'bull';

import { IPostJobData } from '@post/interfaces/post.interface';
import { postWorker } from '@worker/post.worker';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';

class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob('addPostToDb', 5, postWorker.savePostToDb as ProcessPromiseFunction<IBaseJobData>);
    this.processJob('deletePostFromDb', 5, postWorker.deletePostFromDb as ProcessPromiseFunction<IBaseJobData>);
    this.processJob('updatePostInDb', 5, postWorker.updatePostInDb as ProcessPromiseFunction<IBaseJobData>);
  }

  public addPostJob(name: string, data: IPostJobData) {
    this.addJob(name, data);
  }
}

export const postQueue = new PostQueue();
