import { authUserPayload } from '@root/mocks/auth.mock';
import {
  notificationData,
  notificationMockRequest,
  notificationMockResponse,
} from '@root/mocks/notification.mock';
import { getNotifications } from '@notification/controllers/getNotifications';
import { notificationService } from '@service/db/notification.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/db/notification.service');

describe('Get Notifications', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send empty array if user does not have notifications', async () => {
    const req = notificationMockRequest({}, authUserPayload);
    const res = notificationMockResponse();
    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([]);

    await getNotifications.notifications(req, res);
    expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser!.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User notifications',
      notifications: [],
    });
  });

  it('should send correct json response', async () => {
    const req = notificationMockRequest({}, authUserPayload);
    const res = notificationMockResponse();
    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([notificationData]);

    await getNotifications.notifications(req, res);
    expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser!.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User notifications',
      notifications: [notificationData],
    });
  });
});
