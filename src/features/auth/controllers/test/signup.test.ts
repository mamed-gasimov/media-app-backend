/* eslint-disable @typescript-eslint/no-explicit-any */
import { signUp } from '@auth/controllers/signup';
import { ISignUpRequestBody } from '@auth/interfaces/auth.interface';
import * as cloudinaryUploads from '@global/helpers/cloudinaryUpload';
import { CustomError } from '@global/helpers/errorHandler';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinaryUpload');

const getTestData = (body: ISignUpRequestBody, outputMessage: string) => {
  const req = authMockRequest({}, body);
  const res = authMockResponse();

  signUp.create(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeErrors().message).toEqual(outputMessage);
  });
};

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    getTestData(
      {
        username: '',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Username is a required field'
    );
  });

  it('should throw an error if username length is less than minimum length', () => {
    getTestData(
      {
        username: 'te',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Invalid username'
    );
  });

  it('should throw an error if username length is greater than maximum length', () => {
    getTestData(
      {
        username: 'some very long username',
        email: 'manny@test.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Invalid username'
    );
  });

  it('should throw an error if email is not valid', () => {
    getTestData(
      {
        username: 'test',
        email: 'invalid email',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Email must be valid'
    );
  });

  it('should throw an error if email is not available', () => {
    getTestData(
      {
        username: 'test',
        email: '',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Email is a required field'
    );
  });

  it('should throw an error if password is not available', () => {
    getTestData(
      {
        username: 'test',
        email: 'test@gmail.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Password is a required field'
    );
  });

  it('should throw an error if password length is less than minimum length', () => {
    getTestData(
      {
        username: 'test',
        email: 'test@gmail.com',
        password: 'te',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Invalid password'
    );
  });

  it('should throw an error if password length is greater than maximum length', () => {
    getTestData(
      {
        username: 'test',
        email: 'test@gmail.com',
        password: 'some really long password',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      },
      'Invalid password'
    );
  });

  it('should throw unauthorize error if user already exists', () => {
    const req = authMockRequest(
      {},
      {
        username: 'test',
        email: 'manny@me.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      }
    );
    const res = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);

    signUp.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('User is already exists!');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req = authMockRequest(
      {},
      {
        username: 'test',
        email: 'manny@me.com',
        password: 'qwerty123',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==',
      }
    );
    const res = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest
      .spyOn(cloudinaryUploads, 'uploads')
      .mockImplementation((): any => Promise.resolve({ version: '1234737373', public_id: '123456' }));

    await signUp.create(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User is created successfully!',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt,
    });
  });
});
