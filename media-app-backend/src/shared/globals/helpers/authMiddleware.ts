import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { AuthPayload } from '@auth/interfaces/auth.interface';
import { NotAuthorizedError } from '@global/helpers/errorHandler';
import { config } from '@root/config';

class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction) {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please log in again.');
    }

    try {
      const payload = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is not valid. Please log in again.');
    }

    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction) {
    if (!req.currentUser) {
      throw new NotAuthorizedError('Not authenticated.');
    }

    next();
  }
}

export const authMiddleware = new AuthMiddleware();
