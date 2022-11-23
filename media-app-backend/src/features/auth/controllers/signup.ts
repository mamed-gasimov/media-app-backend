import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';

import { IAuthDocument, ISignUpData, ISignUpRequestBody } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemas/signup';
import { joiValidation } from '@global/decorators/joiValidation.decorator';
import { uploads } from '@global/helpers/cloudinaryUpload';
import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { authService } from '@service/db/auth.service';

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

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User is created successfully!',
      authData,
    });
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
}

export const signUp = new SignUp();
