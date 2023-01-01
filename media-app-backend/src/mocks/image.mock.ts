/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { IFileImageDocument } from '@image/interfaces/image.interface';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { IJWT } from '@root/mocks/auth.mock';

export const imagesMockRequest = (
  sessionData: IJWT,
  body: any,
  currentUser?: AuthPayload | null,
  params?: IParams
) =>
  ({
    session: sessionData,
    body,
    params,
    currentUser,
  } as Request);

export const imagesMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IParams {
  userId?: string;
  imageId?: string;
  bgImageId?: string;
}

export const fileDocumentMock: IFileImageDocument = {
  userId: new Types.ObjectId('60263f14648fed5246e322d9'),
  bgImageVersion: '2468',
  bgImageId: '60263f',
  imgVersion: '',
  imgId: '',
  createdAt: new Date(),
} as IFileImageDocument;
