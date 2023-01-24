import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import publicIP from 'ip';
import moment from 'moment';

import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { UserCache } from '@service/redis/user.cache';
import { userQueue } from '@service/queues/user.queue';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { emailQueue } from '@service/queues/email.queue';
import { resetPasswordTemplate } from '@service/emails/templates/resetPassword/resetPasswordTemplate';
import { changePasswordSchema, notificationSettingsSchema } from '@user/schemas/userInfo';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { IAuthDocument } from '@auth/interfaces/auth.interface';

const userCache = new UserCache();

class UpdateUserInfo {
  @joiValidation(notificationSettingsSchema)
  public async notification(req: Request, res: Response) {
    await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', {
      key: `${req.currentUser!.userId}`,
      value: req.body,
    });
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Notification settings updated successfully', settings: req.body });
  }

  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }
    const existingUser = (await authService.getAuthUserByUsername(
      req.currentUser!.username
    )) as IAuthDocument;

    const passwordsMatch = await existingUser?.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword = await existingUser?.hashPassword(newPassword);
    userService.updatePassword(`${req.currentUser!.username}`, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm'),
    };
    const template = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    emailQueue.addEmailJob('changePassword', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password update confirmation',
    });
    res.status(HTTP_STATUS.OK).json({
      message: 'Password updated successfully. You will be redirected shortly to the login page.',
    });
  }
}

export const updateUserInfo = new UpdateUserInfo();
