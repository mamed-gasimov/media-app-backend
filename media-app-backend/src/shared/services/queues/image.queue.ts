import { ProcessPromiseFunction } from 'bull';

import { IFileImageJobData } from '@image/interfaces/image.interface';
import { BaseQueue, IBaseJobData } from '@service/queues/base.queue';
import { imageWorker } from '@worker/image.worker';

class ImageQueue extends BaseQueue {
  constructor() {
    super('images');
    this.processJob(
      'addUserProfileImageToDb',
      5,
      imageWorker.addUserProfileImageToDb as ProcessPromiseFunction<IBaseJobData>
    );
    this.processJob('addBGImageToDb', 5, imageWorker.addBGImageToDb as ProcessPromiseFunction<IBaseJobData>);
    this.processJob('addImageToDb', 5, imageWorker.addImageToDb as ProcessPromiseFunction<IBaseJobData>);
    this.processJob(
      'removeImageFromDb',
      5,
      imageWorker.removeImageFromDb as ProcessPromiseFunction<IBaseJobData>
    );
  }

  public addImageJob(name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }
}

export const imageQueue = new ImageQueue();
