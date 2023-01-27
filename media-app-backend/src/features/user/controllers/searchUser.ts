import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { Helpers } from '@global/helpers/helpers';
import { userService } from '@service/db/user.service';
import { BadRequestError } from '@global/helpers/errorHandler';

class SearchUser {
  public async user(req: Request, res: Response) {
    const { query } = req.params;

    if (!query?.trim()) {
      throw new BadRequestError('Invalid request');
    }

    const regex = new RegExp(Helpers.escapeRegex(query), 'i');
    const users = await userService.searchUsers(regex);
    const usersExcludeCurrent = users.filter((item) => String(item._id) !== String(req.currentUser!.userId));

    res.status(HTTP_STATUS.OK).json({ message: 'Search results', search: usersExcludeCurrent });
  }
}

export const searchUser = new SearchUser();
