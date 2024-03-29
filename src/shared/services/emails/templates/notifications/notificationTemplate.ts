import fs from 'fs';
import ejs from 'ejs';

import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate) {
    const { username, header, message } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification-template.ejs', 'utf8'), {
      username,
      header,
      message,
    });
  }
}

export const notificationTemplate = new NotificationTemplate();
