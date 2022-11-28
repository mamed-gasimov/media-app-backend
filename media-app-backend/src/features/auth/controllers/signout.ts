import { Request, Response } from 'express';
import HTTP_STATUSES from 'http-status-codes';

class SignOut {
  public async update(req: Request, res: Response) {
    req.session = null;
    res.status(HTTP_STATUSES.OK).json({ message: 'Logout was successful!', user: {}, token: '' });
  }
}

export const signOut = new SignOut();
