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
import { changePasswordSchema, userProfileInfoSchema } from '@user/schemas/userInfo';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { IAuthDocument } from '@auth/interfaces/auth.interface';

const userCache = new UserCache();

class UpdateUserInfo {
  @joiValidation(userProfileInfoSchema)
  public async updateProfileInfo(req: Request, res: Response) {
    const { social, notifications, quote, work, school, location } = req.body;

    const currentUserId = req.currentUser!.userId;
    const user = await userService.getUserById(currentUserId);

    if (!user) {
      throw new BadRequestError('Something went wrong. Please log in again.');
    }

    const basicInfo = {
      quote: (quote as string) || user!.quote,
      work: (work as string) || user!.work,
      school: (school as string) || user!.school,
      location: (location as string) || user!.location,
    };

    const notificationSettings = {
      messages: notifications?.messages ?? user!.notifications.messages,
      reactions: notifications?.reactions ?? user!.notifications.reactions,
      comments: notifications?.comments ?? user!.notifications.comments,
      follows: notifications?.follows ?? user!.notifications.follows,
    };

    const socialLinks = {
      instagram: (social?.instagram as string) || user!.social.instagram,
      twitter: (social?.twitter as string) || user!.social.twitter,
      facebook: (social?.facebook as string) || user!.social.facebook,
      youtube: (social?.youtube as string) || user!.social.youtube,
    };

    if (work || quote || school || location) {
      for (const [key, value] of Object.entries(basicInfo)) {
        await userCache.updateSingleUserItemInCache(`${currentUserId}`, key, `${value}`);
      }
      userQueue.addUserJob('updateBasicInfoInDb', {
        key: `${currentUserId}`,
        value: basicInfo,
      });
    }

    if (social) {
      await userCache.updateSingleUserItemInCache(`${currentUserId}`, 'social', socialLinks);
      userQueue.addUserJob('updateSocialLinksInDb', {
        key: `${currentUserId}`,
        value: socialLinks,
      });
    }

    if (notifications) {
      await userCache.updateSingleUserItemInCache(`${currentUserId}`, 'notifications', notificationSettings);
      userQueue.addUserJob('updateNotificationSettings', {
        key: `${currentUserId}`,
        value: notificationSettings,
      });
    }

    res.status(HTTP_STATUS.OK).json({ message: 'User profile was updated successfully' });
  }

  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('Passwords are same');
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
      message: 'Password updated successfully',
    });
  }
}

export const updateUserInfo = new UpdateUserInfo();
