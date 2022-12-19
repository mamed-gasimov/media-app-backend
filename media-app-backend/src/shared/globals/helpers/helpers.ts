import crypto from 'crypto';
import { ObjectId } from 'mongodb';

export class Helpers {
  static firstLetterUpperCase(str: string) {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((namePart) => namePart[0].toUpperCase() + namePart.substring(1))
      .join(' ');
  }

  static lowerCase(str: string) {
    return str.toLowerCase();
  }

  static generateRandomIntegers(integerLength: number) {
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  static generateRandomCharacters(bytes: number) {
    const randomBytes = crypto.randomBytes(bytes);
    return randomBytes.toString('hex');
  }

  static parseJson(prop: string) {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
    return JSON.parse(prop);
  }

  static checkValidObjectId(id: string) {
    if (!id || !ObjectId.isValid(id)) {
      return false;
    }

    const objectId = new ObjectId(id);
    if (String(objectId) !== id) {
      return false;
    }

    return true;
  }
}
