import { authUserPayload } from '@root/mocks/auth.mock';
import { fileDocumentMock, imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { getImages } from '@image/controllers/getImages';
import { imageService } from '@service/db/image.service';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();

describe('Get Images', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if userId is not available', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { userId: '' });
    const res = imagesMockResponse();
    getImages.images(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if userId is not valid mongodb ObjectId', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { userId: '12345' });
    const res = imagesMockResponse();
    getImages.images(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should send correct json response', async () => {
    const req = imagesMockRequest({}, {}, authUserPayload, { userId: '60263f14648fed5246e322d9' });
    const res = imagesMockResponse();
    jest.spyOn(imageService, 'getImages').mockResolvedValue([fileDocumentMock]);

    await getImages.images(req, res);
    expect(imageService.getImages).toHaveBeenCalledWith(req.params.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User images',
      images: [fileDocumentMock],
    });
  });
});
