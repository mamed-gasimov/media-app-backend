import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';

class UserService {
  public async addUserData(data: IUserDocument) {
    await UserModel.create(data);
  }
}

export const userService = new UserService();
