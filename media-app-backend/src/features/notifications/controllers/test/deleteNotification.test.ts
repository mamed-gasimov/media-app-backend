import { Server } from 'socket.io';

import { authUserPayload } from '@root/mocks/auth.mock';
import * as notificationServer from '@socket/notification.sockets';
import { notificationMockRequest, notificationMockResponse } from '@root/mocks/notification.mock';
import { notificationQueue } from '@service/queues/notification.queue';
import { deleteNotification } from '@notification/controllers/deleteNotification';
import { CustomError } from '@global/helpers/errorHandler';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

Object.defineProperties(notificationServer, {
  socketIONotificationObject: {
    value: new Server(),
    writable: true,
  },
});

describe('Delete notification', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if notificationId is not available', async () => {
    const req = notificationMockRequest({}, authUserPayload, { notificationId: '' });
    const res = notificationMockResponse();

    deleteNotification.notification(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should throw an error if notificationId is not valid mongodb ObjectId', async () => {
    const req = notificationMockRequest({}, authUserPayload, { notificationId: '12345' });
    const res = notificationMockResponse();

    deleteNotification.notification(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid request.');
    });
  });

  it('should send correct json response', async () => {
    const req = notificationMockRequest({}, authUserPayload, { notificationId: '60263f14648fed5446e322d9' });
    const res = notificationMockResponse();
    jest.spyOn(notificationServer.socketIONotificationObject, 'emit');
    jest.spyOn(notificationQueue, 'addNotificationJob');

    await deleteNotification.notification(req, res);
    expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith(
      'delete notification',
      req.params.notificationId
    );
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith('deleteNotification', {
      key: req.params.notificationId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification was deleted successfully',
    });
  });
});
