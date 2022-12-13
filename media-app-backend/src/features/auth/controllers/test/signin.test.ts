/* eslint-disable @typescript-eslint/no-explicit-any */
import { signIn } from '@auth/controllers/signin';
import { CustomError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { mergedAuthAndUserData } from '@root/mocks/user.mock';
import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';

const USERNAME = 'John';
const PASSWORD = 'qwerty123';
const WRONG_USERNAME = 'jo';
const WRONG_PASSWORD = 'qw';
const LONG_PASSWORD = 'some very long long password';
const LONG_USERNAME = 'some very long long username';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

const getTestData = (body: { username: string; password: string }, outputMessage: string) => {
  const req = authMockRequest({}, body);
  const res = authMockResponse();

  signIn.read(req, res).catch((error: CustomError) => {
    expect(error.statusCode).toEqual(400);
    expect(error.serializeErrors().message).toEqual(outputMessage);
  });
};

describe('SignIn', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    getTestData({ username: '', password: PASSWORD }, 'Username is a required field');
  });

  it('should throw an error if username length is less than minimum length', () => {
    getTestData({ username: WRONG_USERNAME, password: WRONG_PASSWORD }, 'Invalid username');
  });

  it('should throw an error if username length is greater than maximum length', () => {
    getTestData({ username: LONG_USERNAME, password: WRONG_PASSWORD }, 'Invalid username');
  });

  it('should throw an error if password is not available', () => {
    getTestData({ username: USERNAME, password: '' }, 'Password is a required field');
  });

  it('should throw an error if password length is less than minimum length', () => {
    getTestData({ username: USERNAME, password: WRONG_PASSWORD }, 'Invalid password');
  });

  it('should throw an error if password length is greater than maximum length', () => {
    getTestData({ username: USERNAME, password: LONG_PASSWORD }, 'Invalid password');
  });

  it('should throw an error if username does not exist', () => {
    const req = authMockRequest({}, { username: USERNAME, password: PASSWORD });
    const res = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValueOnce(null);

    signIn.read(req, res).catch((error: CustomError) => {
      expect(authService.getAuthUserByUsername).toHaveBeenCalledWith(Helpers.firstLetterUpperCase(req.body.username));
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials!');
    });
  });

  it('should throw an error if password is not correct', async () => {
    const req = authMockRequest({}, { username: USERNAME, password: PASSWORD });
    const res = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(false);

    signIn.read(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials!');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req = authMockRequest({}, { username: USERNAME, password: PASSWORD });
    const res = authMockResponse();
    authMock.comparePassword = () => Promise.resolve(true);
    jest.spyOn(authService, 'getAuthUserByUsername').mockResolvedValue(authMock);
    jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue(mergedAuthAndUserData);

    await signIn.read(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User logged in successfully!',
      user: mergedAuthAndUserData,
      token: req.session?.jwt,
    });
  });
});
