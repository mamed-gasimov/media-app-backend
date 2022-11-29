import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { userService } from '@service/db/user.service';
import { UserCache } from '@service/redis/user.cache';

const userCache = new UserCache();

class CurrentUser {
  public async read(req: Request, res: Response) {
    let isUser = false;
    let token = null;
    let user = null;

    const cachedUser = await userCache.getUserFromCache(`${req.currentUser!.userId}`);

    const existingUser = cachedUser || (await userService.getUserById(`${req.currentUser!.userId}`));

    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }

    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}

export const currentUser = new CurrentUser();
