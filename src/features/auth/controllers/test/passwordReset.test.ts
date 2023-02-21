import { passwordReset } from '@auth/controllers/passwordReset';
import { CustomError } from '@global/helpers/errorHandler';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { authService } from '@service/db/auth.service';
import { emailQueue } from '@service/queues/email.queue';

const WRONG_EMAIL = 'test@email.com';
const CORRECT_EMAIL = 'manny@me.com';
const INVALID_EMAIL = 'test';
const CORRECT_PASSWORD = 'qwerty123';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/email.queue');
jest.mock('@service/db/auth.service');
jest.mock('@service/emails/mail.transport');

const getTestData = (
  body: { email: string } | { password: string; confirmPassword: string },
  outputMessage: string,
  method: 'create' | 'update'
) => {
  const req = authMockRequest({}, body);
  const res = authMockResponse();

  passwordReset[method](req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeErrors().message).toEqual(outputMessage);
  });
};

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if email is invalid', () => {
      getTestData({ email: INVALID_EMAIL }, 'Field must be valid', 'create');
    });

    it('should throw "Invalid credentials" if email does not exist', () => {
      getTestData({ email: WRONG_EMAIL }, 'Invalid credentials', 'create');
    });

    it('should send correct json response', async () => {
      const req = authMockRequest({}, { email: CORRECT_EMAIL });
      const res = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await passwordReset.create(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reset password email is sent.',
      });
    });
  });

  describe('update', () => {
    it('should throw an error if password is empty', () => {
      getTestData({ password: '', confirmPassword: '' }, 'Password is a required field', 'update');
    });

    it('should throw an error if password and confirmPassword are different', () => {
      getTestData(
        { password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` },
        'Passwords should match',
        'update'
      );
    });

    it('should throw error if reset token is empty', () => {
      const req = authMockRequest(
        {},
        { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD },
        null,
        {
          token: '',
        }
      );
      const res = authMockResponse();
      passwordReset.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token is required!');
      });
    });

    it('should throw error if reset token has expired', () => {
      const req = authMockRequest(
        {},
        { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD },
        null,
        {
          token: '12sde3t8g8j',
        }
      );
      const res = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(null);
      passwordReset.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset token has expired.');
      });
    });

    it('should send correct json response', async () => {
      const req = authMockRequest(
        {},
        { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD },
        null,
        {
          token: '12sde3',
        }
      );
      const res = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await passwordReset.update(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated.',
      });
    });
  });
});
