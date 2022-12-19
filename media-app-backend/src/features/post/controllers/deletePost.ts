import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { BadRequestError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { postService } from '@service/db/post.service';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.sockets';

const postCache = new PostCache();

class DeletePost {
  public async post(req: Request, res: Response) {
    const { postId } = req.params;
    if (!Helpers.checkValidObjectId(postId)) {
      throw new BadRequestError('Invalid request.');
    }

    const existingPost = await postService.findPostById(postId);
    if (!existingPost) {
      throw new BadRequestError('Post was not found');
    }

    socketIOPostObject.emit('delete post', postId);
    await postCache.deletePostFromCache(postId, req.currentUser!.userId);
    postQueue.addPostJob('deletePostFromDb', { keyOne: postId, keyTwo: req.currentUser!.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}

export const deletePost = new DeletePost();
