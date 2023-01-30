import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { imageService } from '@service/db/image.service';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

class GetImages {
  public async images(req: Request, res: Response) {
    const { userId } = req.params;
    if (!Helpers.checkValidObjectId(userId)) {
      throw new BadRequestError('Invalid request.');
    }

    const images = await imageService.getImages(userId);
    res.status(HTTP_STATUS.OK).json({ message: 'User images', images });
  }
}

export const getImages = new GetImages();
