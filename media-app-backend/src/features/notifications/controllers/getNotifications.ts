import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { notificationService } from '@service/db/notification.service';

export class GetNotifications {
  public async notifications(req: Request, res: Response) {
    const notifications = await notificationService.getNotifications(req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({ message: 'User notifications', notifications });
  }
}

export const getNotifications = new GetNotifications();
