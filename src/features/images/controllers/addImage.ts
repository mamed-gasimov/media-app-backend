import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import HTTP_STATUS from 'http-status-codes';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { uploads } from '@global/helpers/cloudinaryUpload';
import { addImageSchema } from '@image/schemas/images';
import { IUserDocument } from '@user/interfaces/user.interface';
import { imageQueue } from '@service/queues/image.queue';
import { UserCache } from '@service/redis/user.cache';
import { BadRequestError } from '@global/helpers/errorHandler';
import { socketIOImageObject } from '@socket/image.sockets';
import { Helpers } from '@global/helpers/helpers';
import { IBgUploadResponse } from '@image/interfaces/image.interface';
import { config } from '@root/config';

const userCache = new UserCache();

class AddImage {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response) {
    const { image } = req.body;
    if (!Helpers.isDataBase64(image)) {
      throw new BadRequestError('Invalid data format.');
    }

    const result = (await uploads(image, req.currentUser!.userId, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.');
    }

    const url = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
    const cachedUser = (await userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'profilePicture',
      url
    )) as IUserDocument;

    socketIOImageObject.emit('update user', cachedUser);
    imageQueue.addImageJob('addUserProfileImageToDb', {
      key: `${req.currentUser!.userId}`,
      value: url,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }

  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response) {
    const { version, publicId } = await AddImage.prototype.backgroundUpload(req.body.image);

    const bgImageId = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageId',
      publicId
    ) as Promise<IUserDocument>;
    const bgImageVersion = userCache.updateSingleUserItemInCache(
      `${req.currentUser!.userId}`,
      'bgImageVersion',
      version
    ) as Promise<IUserDocument>;

    const response = (await Promise.all([bgImageId, bgImageVersion])) as [IUserDocument, IUserDocument];

    socketIOImageObject.emit('update user', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: response[0],
    });
    imageQueue.addImageJob('addBGImageToDb', {
      key: `${req.currentUser!.userId}`,
      imgId: publicId,
      imgVersion: version.toString(),
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataBase64 = Helpers.isDataBase64(image);
    let version = '';
    let publicId = '';

    if (isDataBase64) {
      const result = (await uploads(image)) as UploadApiResponse;
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.public_id;
      }
    } else {
      const isValidUrl = Helpers.isValidHttpsUrl(image);
      if (isValidUrl) {
        const value = image.split('/');
        version = value[value.length - 2];
        publicId = value[value.length - 1];
      } else {
        throw new BadRequestError('Invalid data format.');
      }
    }

    return { version: version?.replace(/v/g, ''), publicId };
  }
}

export const addImage = new AddImage();
