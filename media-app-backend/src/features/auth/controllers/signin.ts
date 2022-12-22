import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';

import { loginSchema } from '@auth/schemas/signin';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { BadRequestError } from '@global/helpers/errorHandler';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';

class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response) {
    const { username, password } = req.body;

    if (req.session?.jwt) {
      throw new BadRequestError('You need to sign out first.');
    }

    const existingUser = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials!');
    }

    const passwordMatch = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials!');
    }

    const user = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJWT = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      },
      config.JWT_TOKEN as string
    );

    req.session = { jwt: userJWT };

    const userDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    };

    res.status(HTTP_STATUS.OK).json({
      message: 'User logged in successfully!',
      user: userDocument,
      token: userJWT,
    });
  }
}

export const signIn = new SignIn();
