import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification.sockets';
import { Helpers } from '@global/helpers/helpers';
import { BadRequestError } from '@global/helpers/errorHandler';

class UpdateNotification {
  public async notification(req: Request, res: Response) {
    const { notificationId } = req.params;
    if (!Helpers.checkValidObjectId(notificationId)) {
      throw new BadRequestError('Invalid request.');
    }

    socketIONotificationObject.emit('update notification', notificationId);
    notificationQueue.addNotificationJob('updateNotification', { key: notificationId });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' });
  }
}

export const updateNotification = new UpdateNotification();
