/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';

import { authUserPayload } from '@root/mocks/auth.mock';
import * as imageServer from '@socket/image.sockets';
import { fileDocumentMock, imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { imageQueue } from '@service/queues/image.queue';
import { deleteImage } from '@image/controllers/deleteImage';
import { imageService } from '@service/db/image.service';
import { UserCache } from '@service/redis/user.cache';
import { CustomError } from '@global/helpers/errorHandler';
import * as cloudinaryUploads from '@global/helpers/cloudinaryUpload';
import { userService } from '@service/db/user.service';
import { existingUser } from '@root/mocks/user.mock';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');

Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Delete Image', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if imageId is not available', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { imageId: '' });
    const res = imagesMockResponse();
    deleteImage.image(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if imageId is not valid mongodb ObjectId', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' });
    const res = imagesMockResponse();
    deleteImage.image(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if image does not exist', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { imageId: '60263f14648fed5246e322d9' });
    const res = imagesMockResponse();
    jest.spyOn(imageService, 'getImageId').mockResolvedValue(null);

    deleteImage.image(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Image was not found.');
    });
  });

  it('should send correct json response for image removal', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { imageId: '60263f14648fed5246e322d9' });
    const res = imagesMockResponse();

    jest.spyOn(imageService, 'getImageId').mockResolvedValue(fileDocumentMock);
    jest.spyOn(imageServer.socketIOImageObject, 'emit');
    jest.spyOn(imageQueue, 'addImageJob');
    jest
      .spyOn(cloudinaryUploads, 'deleteFileFromCloudinary')
      .mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));

    await deleteImage.image(req, res);
    expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', req.params.imageId);
    expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDb', { imageId: req.params.imageId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Image deleted successfully',
    });
  });

  it('should send correct json response for background image removal', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { bgImageId: '60263f' });
    const res = imagesMockResponse();
    jest.spyOn(imageServer.socketIOImageObject, 'emit');
    jest.spyOn(imageQueue, 'addImageJob');
    jest.spyOn(imageService, 'getImageByBackgroundId').mockResolvedValue(fileDocumentMock);
    jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');
    jest.spyOn(userService, 'removeBgImg').mockResolvedValue(existingUser);

    await deleteImage.backgroundImage(req, res);
    expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', fileDocumentMock._id);
    expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDb', {
      imageId: fileDocumentMock._id,
    });
    expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(
      `${req.currentUser?.userId}`,
      'bgImageId',
      ''
    );
    expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      ''
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Image deleted successfully',
    });
  });
});
