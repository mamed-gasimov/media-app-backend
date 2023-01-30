import { signOut } from '@auth/controllers/signout';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';

describe('SignOut', () => {
  it('should set session to null', async () => {
    const req = authMockRequest({});
    const res = authMockResponse();
    await signOut.update(req, res);
    expect(req.session).toBeNull();
  });

  it('should send correct json response', async () => {
    const req = authMockRequest({});
    const res = authMockResponse();
    await signOut.update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Logout was successful!',
      user: {},
      token: '',
    });
  });
});
