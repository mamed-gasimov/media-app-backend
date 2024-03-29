import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

import { IAuthDocument, ISignUpData, ISignUpRequestBody } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemas/signup';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { uploads } from '@global/helpers/cloudinaryUpload';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { authQueue } from '@service/queues/auth.queue';
import { userQueue } from '@service/queues/user.queue';
import { UserCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

const userCache = new UserCache();

class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response) {
    const { username, email, password, avatarColor, avatarImage } = req.body as ISignUpRequestBody;
    const checkUserExist = await authService.getUserByUsernameOrEmail(username, email);
    if (checkUserExist) {
      throw new BadRequestError('User is already exists!');
    }

    const authObjectId = new ObjectId();
    const userObjectId = new ObjectId();
    const uId = Helpers.generateRandomIntegers(12).toString();
    const authData = SignUp.prototype.signUpData({
      _id: authObjectId,
      username,
      email,
      password,
      uId,
      avatarColor,
    });

    const result = await uploads(avatarImage, `${userObjectId}`, true, true);
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occured! Try again.');
    }

    // Add to redis cache
    const userDataForCache = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    authQueue.addAuthUserJob('addAuthUserToDb', { value: authData });
    userQueue.addUserJob('addUserToDb', { value: userDataForCache });

    const userJWT = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJWT };

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User is created successfully!',
      user: userDataForCache,
      token: userJWT,
    });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId) {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_TOKEN as string
    );
  }

  private signUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, password, uId, avatarColor } = data;

    return {
      _id,
      username: Helpers.firstLetterUpperCase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      uId,
      createdAt: new Date(),
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUpperCase(username),
      email,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true,
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
    } as unknown as IUserDocument;
  }
}

export const signUp = new SignUp();
