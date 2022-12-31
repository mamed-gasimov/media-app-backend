import { DoneCallback, Job } from 'bull';

import { config } from '@root/config';
import { imageService } from '@service/db/image.service';
import { IFileImageJobData } from '@image/interfaces/image.interface';

const log = config.createLogger('imageWorker');

class ImageWorker {
  async addUserProfileImageToDb(job: Job<IFileImageJobData>, done: DoneCallback) {
    try {
      const { key, value, imgId, imgVersion } = job.data;
      await imageService.addUserProfileImageToDb(key!, value!, imgId!, imgVersion!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async addBGImageToDb(job: Job<IFileImageJobData>, done: DoneCallback) {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addBackgroundImageToDb(key!, imgId!, imgVersion!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async addImageToDb(job: Job<IFileImageJobData>, done: DoneCallback) {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addImage(key!, imgId!, imgVersion!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async removeImageFromDb(job: Job<IFileImageJobData>, done: DoneCallback) {
    try {
      const { imageId } = job.data;
      await imageService.removeImageFromDb(imageId!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const imageWorker = new ImageWorker();
