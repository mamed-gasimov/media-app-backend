import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@service/queues/base.queue';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
  }

  public addAuthUserJob(name: string, data: IAuthJob) {
    this.addJob(name, data);
  }
}

export const authQueue = new AuthQueue();
