import { Types } from 'mongoose';

import { ImageModel } from '@image/models/image.model';
import { UserModel } from '@user/models/user.model';
import { IFileImageDocument } from '@image/interfaces/image.interface';

class ImageService {
  public async addUserProfileImageToDb(userId: string, url: string, imgId: string, imgVersion: string) {
    await UserModel.updateOne({ _id: userId }, { $set: { profilePicture: url } }).exec();
    await this.addImage(userId, imgId, imgVersion, 'profile');
  }

  public async addBackgroundImageToDb(userId: string, imgId: string, imgVersion: string) {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { bgImageId: imgId, bgImageVersion: imgVersion } }
    ).exec();
    await this.addImage(userId, imgId, imgVersion, 'background');
  }

  public async addImage(userId: string, imgId: string, imgVersion: string, type?: 'profile' | 'background') {
    await ImageModel.create({
      userId,
      bgImageVersion: type === 'background' ? imgVersion : '',
      bgImageId: type === 'background' ? imgId : '',
      imgVersion: type === 'profile' ? imgVersion : '',
      imgId: type === 'profile' ? imgId : '',
    });
  }

  public async removeImageFromDb(imageId: string) {
    await ImageModel.deleteOne({ _id: imageId }).exec();
  }

  public async getImageByBackgroundId(bgImageId: string) {
    const image = (await ImageModel.findOne({ bgImageId }).exec()) as IFileImageDocument;
    return image;
  }

  public async getImages(userId: string) {
    const images: IFileImageDocument[] = await ImageModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
    ]);
    return images;
  }
}

export const imageService = new ImageService();
