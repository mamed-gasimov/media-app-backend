import { PushOperator } from 'mongodb';
import { Types } from 'mongoose';

import { UserModel } from '@user/models/user.model';

class BlockUserService {
  public async blockUser(userId: string, blockedUserId: string) {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId, blocked: { $ne: new Types.ObjectId(blockedUserId) } },
          update: {
            $push: {
              blocked: new Types.ObjectId(blockedUserId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: { _id: blockedUserId, blockedBy: { $ne: new Types.ObjectId(userId) } },
          update: {
            $push: {
              blockedBy: new Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ]);
  }

  public async unblockUser(userId: string, blockedUserId: string) {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new Types.ObjectId(blockedUserId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: { _id: blockedUserId },
          update: {
            $pull: {
              blockedBy: new Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ]);
  }
}

export const blockUserService = new BlockUserService();
