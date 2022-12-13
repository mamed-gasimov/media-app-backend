import { getPosts } from '@post/controllers/getPosts';
import { authUserPayload } from '@root/mocks/auth.mock';
import { newPost, postMockData, postMockRequest, postMockResponse } from '@root/mocks/post.mock';
import { postService } from '@service/db/post.service';
import { PostCache } from '@service/redis/post.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');

describe('Get Posts', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('posts', () => {
    it('should send correct json response if posts exist in cache', async () => {
      const req = postMockRequest(newPost, authUserPayload, { page: '1' });
      const res = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([postMockData]);
      jest.spyOn(PostCache.prototype, 'getTotalPostNumberFromCache').mockResolvedValue(1);

      await getPosts.posts(req, res);
      expect(PostCache.prototype.getPostsFromCache).toHaveBeenCalledWith('post', 0, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1,
      });
    });

    it('should send correct json response if posts exist in database', async () => {
      const req = postMockRequest(newPost, authUserPayload, { page: '1' });
      const res = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(PostCache.prototype, 'getTotalPostNumberFromCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);
      jest.spyOn(postService, 'postCount').mockResolvedValue(1);

      await getPosts.posts(req, res);
      expect(postService.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [postMockData],
        totalPosts: 1,
      });
    });

    it('should send empty posts', async () => {
      const req = postMockRequest(newPost, authUserPayload, { page: '1' });
      const res = postMockResponse();
      jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
      jest.spyOn(PostCache.prototype, 'getTotalPostNumberFromCache').mockResolvedValue(0);
      jest.spyOn(postService, 'getPosts').mockResolvedValue([]);
      jest.spyOn(postService, 'postCount').mockResolvedValue(0);

      await getPosts.posts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All posts',
        posts: [],
        totalPosts: 0,
      });
    });
  });
});
