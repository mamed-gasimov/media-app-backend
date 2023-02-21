import { model, Schema, Types } from 'mongoose';

import { INotificationDocument, INotification } from '@notification/interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';

const notificationSchema = new Schema({
  userTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  userFrom: { type: Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: { type: String, default: '' },
  entityId: Types.ObjectId,
  createdItemId: Types.ObjectId,
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() },
});

notificationSchema.methods.insertNotification = async function (data: INotification) {
  const { userTo } = data;

  await NotificationModel.create({ ...data });
  try {
    const notifications = await notificationService.getNotifications(userTo);
    return notifications;
  } catch (error) {
    return error;
  }
};

const NotificationModel = model<INotificationDocument>('Notification', notificationSchema, 'Notification');
export { NotificationModel };
