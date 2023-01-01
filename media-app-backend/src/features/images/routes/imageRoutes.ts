import express, { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { addImage } from '@image/controllers/addImage';

class ImageRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/images/profile', authMiddleware.checkAuthentication, addImage.profileImage);
    this.router.post('/images/background', authMiddleware.checkAuthentication, addImage.backgroundImage);

    return this.router;
  }
}

export const imageRoutes = new ImageRoutes();
