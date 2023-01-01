import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { socketIOImageObject } from '@socket/image.sockets';
import { imageQueue } from '@service/queues/image.queue';
import { IFileImageDocument } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { deleteFileFromCloudinary } from '@global/helpers/cloudinaryUpload';

const userCache = new UserCache();

export class DeleteImage {
  public async image(req: Request, res: Response) {
    const { imageId } = req.params;

    if (!Helpers.checkValidObjectId(imageId)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingImage = await imageService.getImageId(imageId);
    if (!existingImage) {
      throw new BadRequestError('Image was not found.');
    }

    socketIOImageObject.emit('delete image', imageId);
    imageQueue.addImageJob('removeImageFromDb', {
      imageId,
    });

    await deleteFileFromCloudinary(existingImage.imgId);
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }

  public async backgroundImage(req: Request, res: Response) {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);
    socketIOImageObject.emit('delete image', image?._id);
    const bgImageId = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageId',
      ''
    ) as Promise<IUserDocument>;
    const bgImageVersion = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageVersion',
      ''
    ) as Promise<IUserDocument>;
    (await Promise.all([bgImageId, bgImageVersion])) as [IUserDocument, IUserDocument];
    imageQueue.addImageJob('removeImageFromDb', {
      imageId: image?._id,
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' });
  }
}

export const deleteImage = new DeleteImage();
