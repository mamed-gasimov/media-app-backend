import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { AuthPayload } from '@auth/interfaces/auth.interface';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { IJWT } from '@root/mocks/auth.mock';
import { existingUserTwo } from '@root/mocks/user.mock';

export const followersMockRequest = (sessionData: IJWT, currentUser?: AuthPayload | null, params?: IParams) =>
  ({
    session: sessionData,
    params,
    currentUser,
  } as Request);

export const followersMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IParams {
  followerId?: string;
  followeeId?: string;
  userId?: string;
}

export const mockFollowerData: IFollowerData = {
  avatarColor: `${existingUserTwo.avatarColor}`,
  followersCount: existingUserTwo.followersCount,
  followingCount: existingUserTwo.followingCount,
  profilePicture: `${existingUserTwo.profilePicture}`,
  postCount: existingUserTwo.postsCount,
  username: `${existingUserTwo.username}`,
  uId: `${existingUserTwo.uId}`,
  _id: new Types.ObjectId(existingUserTwo._id),
};

export const followerData = {
  _id: '605727cd646cb50e668a4e13',
  followerId: {
    username: 'Manny',
    postCount: 5,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13',
  },
  followeeId: {
    username: 'Danny',
    postCount: 10,
    avatarColor: '#ff9800',
    followersCount: 3,
    followingCount: 5,
    profilePicture: 'https://res.cloudinary.com/ratingapp/image/upload/605727cd646eb50e668a4e13',
  },
};
