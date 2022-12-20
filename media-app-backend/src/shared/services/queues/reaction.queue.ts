import { ProcessPromiseFunction } from 'bull';

import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { reactionWorker } from '@worker/reaction.worker';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactions');
    this.processJob('addReactionDataToDb', 5, reactionWorker.saveReactionToDb as ProcessPromiseFunction<IBaseJobData>);
    this.processJob(
      'removeReactionDataFromDb',
      5,
      reactionWorker.removeReactionFromDb as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addReactionJob(name: string, data: IReactionJob) {
    this.addJob(name, data);
  }
}

export const reactionQueue = new ReactionQueue();
