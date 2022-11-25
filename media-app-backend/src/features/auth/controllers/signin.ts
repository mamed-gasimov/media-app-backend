import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';

import { loginSchema } from '@auth/schemas/signin';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response) {
    const { username, password } = req.body;
    const existingUser = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('User is not found!');
    }

    const passwordMatch = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials!');
    }

    const userJWT = JWT.sign(
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      },
      config.JWT_TOKEN as string
    );

    req.session = { jwt: userJWT };

    res.status(HTTP_STATUS.OK).json({
      message: 'User logged in successfully!',
      user: existingUser,
      token: userJWT,
    });
  }
}

export const signIn = new SignIn();
