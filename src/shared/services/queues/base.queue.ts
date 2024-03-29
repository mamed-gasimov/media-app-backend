import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Queue from 'bull';
import Logger from 'bunyan';

import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IPostJobData } from '@post/interfaces/post.interface';
import { config } from '@root/config';
import { IEmailJob } from '@user/interfaces/user.interface';
import { IReactionJob } from '@reaction/interfaces/reaction.interface';
import { ICommentJob } from '@comment/interfaces/comments.interface';
import { IFollowerJobData } from '@follower/interfaces/follower.interface';
import { IBlockedUserJobData } from '@blocked/interfaces/blockedUsers.interface';
import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { IFileImageJobData } from '@image/interfaces/image.interface';
import { IChatJobData, IMessageData } from '@chat/interfaces/chat.interface';

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export type IBaseJobData =
  | IAuthJob
  | IEmailJob
  | IPostJobData
  | IReactionJob
  | ICommentJob
  | IFollowerJobData
  | IBlockedUserJobData
  | INotificationJobData
  | IFollowerJobData
  | IFileImageJobData
  | IChatJobData
  | IMessageData;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });

    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} is completed.`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled.`);
    });
  }

  protected addJob(name: string, data: IBaseJobData) {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessPromiseFunction<IBaseJobData>
  ) {
    this.queue.process(name, concurrency, callback);
  }
}
