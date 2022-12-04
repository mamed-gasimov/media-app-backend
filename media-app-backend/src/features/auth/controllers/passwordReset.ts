import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import publicIP from 'ip';
import moment from 'moment';

import { emailSchema, passwordSchema } from '@auth/schemas/password';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { forgotPasswordTemplate } from '@service/emails/templates/forgotPassword/forgotPasswordTemplate';
import { resetPasswordTemplate } from '@service/emails/templates/resetPassword/resetPasswordTemplate';
import { emailQueue } from '@service/queues/email.queue';

class PasswordReset {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response) {
    const { email } = req.body;
    const existingUser = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('User is not found!');
    }

    const randomCharacters = Helpers.generateRandomCharacters(20);
    await authService.updatePasswordToken(`${existingUser._id}`, randomCharacters, Date.now() * 5 * 60 * 1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);

    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Reset password email is sent.' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response) {
    const { password } = req.body;
    const { token } = req.params;
    if (!token) {
      throw new BadRequestError('Reset token is required!');
    }

    const existingUser = await authService.getAuthUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired!');
    }

    existingUser.password = password;
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetExpires = undefined;

    // password will be hashed due to pre save hook in models
    await existingUser.save();

    const templateParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm'),
    };

    const template = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Password Reset Confirmation',
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}

export const passwordReset = new PasswordReset();
