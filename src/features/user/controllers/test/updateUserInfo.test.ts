/* eslint-disable @typescript-eslint/no-explicit-any */
import { authMockRequest, authMockResponse, authUserPayload } from '@root/mocks/auth.mock';
import { updateUserInfo } from '@user/controllers/updateUserInfo';
import { CustomError } from '@global/helpers/errorHandler';
import { existingUser } from '@root/mocks/user.mock';
import { emailQueue } from '@service/queues/email.queue';
import { userService } from '@service/db/user.service';
import { authService } from '@service/db/auth.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/email.queue');
jest.mock('@service/db/user.service');

describe('Update User Info', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Change Password', () => {
    it('should throw an error if currentPassword is empty', () => {
      const req = authMockRequest(
        {},
        {
          currentPassword: '',
          newPassword: 'manny1234',
          confirmPassword: 'manny1234',
        }
      );
      const res = authMockResponse();
      updateUserInfo.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if newPassword is empty', () => {
      const req = authMockRequest(
        {},
        {
          currentPassword: 'manny1234',
          newPassword: '',
          confirmPassword: 'manny1234',
        }
      );
      const res = authMockResponse();
      updateUserInfo.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if confirmPassword is empty', () => {
      const req = authMockRequest(
        {},
        {
          currentPassword: 'manny1234',
          newPassword: 'manny1234',
          confirmPassword: '',
        }
      );
      const res = authMockResponse();
      updateUserInfo.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Confirm password does not match new password.');
      });
    });

    it('should throw an error if currentPassword does not exist', () => {
      const req = authMockRequest(
        {},
        {
          currentPassword: 'manny1234',
          newPassword: 'manny12345',
          confirmPassword: 'manny12345',
        },
        authUserPayload
      );
      const res = authMockResponse();
      const mockUser = {
        ...existingUser,
        comparePassword: () => false,
      };
      jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(mockUser as any);

      updateUserInfo.password(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Invalid credentials');
      });
    });

    it('should send correct json response', async () => {
      const req = authMockRequest(
        {},
        {
          currentPassword: 'manny1234',
          newPassword: 'manny12345',
          confirmPassword: 'manny12345',
        },
        authUserPayload
      );
      const res = authMockResponse();
      const mockUser = {
        ...existingUser,
        comparePassword: () => true,
        hashPassword: () => 'djejdjr123482ejsj',
      };
      jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'updatePassword');
      const spy = jest.spyOn(emailQueue, 'addEmailJob');

      await updateUserInfo.password(req, res);
      expect(userService.updatePassword).toHaveBeenCalledWith(
        `${req.currentUser!.username}`,
        'djejdjr123482ejsj'
      );
      expect(emailQueue.addEmailJob).toHaveBeenCalledWith(spy.mock.calls[0][0], spy.mock.calls[0][1]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password updated successfully',
      });
    });
  });
});
