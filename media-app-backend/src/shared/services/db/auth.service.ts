import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.model';
import { Helpers } from '@global/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument) {
    await AuthModel.create(data);
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number) {
    await AuthModel.updateOne(
      { _id: authId },
      { passwordResetToken: token, passwordResetExpires: tokenExpiration }
    );
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument | null> {
    const query = {
      $or: [{ username: Helpers.firstLetterUpperCase(username) }, { email: Helpers.lowerCase(email) }],
    };

    const user: IAuthDocument | null = await AuthModel.findOne(query).exec();
    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({
      username: Helpers.firstLetterUpperCase(username),
    }).exec();
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({
      email: Helpers.lowerCase(email),
    }).exec();
    return user;
  }

  public async getAuthUserByPasswordToken(token: string): Promise<IAuthDocument | null> {
    const user: IAuthDocument | null = await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).exec();
    return user;
  }
}

export const authService = new AuthService();
