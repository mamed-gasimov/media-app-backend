import express, { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addImage } from '@image/controllers/addImage';
import { deleteImage } from '@image/controllers/deleteImage';

class ImageRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/images/profile', authMiddleware.checkAuthentication, addImage.profileImage);
    this.router.post('/images/background', authMiddleware.checkAuthentication, addImage.backgroundImage);
    this.router.delete('/images/:imageId', authMiddleware.checkAuthentication, deleteImage.image);
    this.router.delete(
      '/images/background/:bgImageId',
      authMiddleware.checkAuthentication,
      deleteImage.backgroundImage
    );

    return this.router;
  }
}

export const imageRoutes = new ImageRoutes();
