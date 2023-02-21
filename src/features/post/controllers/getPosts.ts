import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { BadRequestError } from '@global/helpers/errorHandler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@service/db/post.service';
import { PostCache } from '@service/redis/post.cache';

const postCache = new PostCache();
const PAGE_SIZE = 10;

class GetPosts {
  public async posts(req: Request, res: Response) {
    const { page } = req.params;

    if (!Number.isInteger(+page) || +page <= 0) {
      throw new BadRequestError('Invalid request.');
    }

    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = parseInt(page) * PAGE_SIZE;
    const skipForRedis = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts = 0;

    const cachedPosts = await postCache.getPostsFromCache('post', skipForRedis, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostNumberFromCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postCount();
    }

    res.status(HTTP_STATUS.OK).json({ message: 'All posts', posts, totalPosts });
  }
}

export const getPosts = new GetPosts();
