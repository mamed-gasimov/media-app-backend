import express, { Router } from 'express';

import { authMiddleware } from '@global/helpers/authMiddleware';
import { updateNotification } from '@notification/controllers/updateNotification';
import { deleteNotification } from '@notification/controllers/deleteNotification';
import { getNotifications } from '@notification/controllers/getNotifications';

class NotificationRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/notifications', authMiddleware.checkAuthentication, getNotifications.notifications);
    this.router.put(
      '/notifications/:notificationId',
      authMiddleware.checkAuthentication,
      updateNotification.notification
    );
    this.router.delete(
      '/notifications/:notificationId',
      authMiddleware.checkAuthentication,
      deleteNotification.notification
    );

    return this.router;
  }
}

export const notificationRoutes = new NotificationRoutes();
