import { Request, Response } from 'express';

import { signOut } from '@auth/controllers/signout';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';

describe('SignOut', () => {
  it('should set session to null', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    await signOut.update(req, res);
    expect(req.session).toBeNull();
  });

  it('should send correct json response', async () => {
    const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = authMockResponse();
    await signOut.update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout was successful!',
      user: {},
      token: '',
    });
  });
});
