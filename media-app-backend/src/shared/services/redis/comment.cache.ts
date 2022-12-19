import { find } from 'lodash';

import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comments.interface';
import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

const log = config.createLogger('commentsCache');

export class CommentsCache extends BaseCache {
  constructor() {
    super('commentsCache');
  }

  public async savePostCommentToCache(postId: string, commentData: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LPUSH(`comments:${postId}`, commentData);
      const commentsCount = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      const count = Number(commentsCount[0]) + 1;
      const dataToSave = ['commentsCount', `${count}`];
      await this.client.HSET(`posts:${postId}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostCommentsFromCache(postId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const item of reply) {
        list.push(Helpers.parseJson(item));
      }
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getCommentsNamesFromCache(postId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const commentsCount: number = await this.client.LLEN(`comments:${postId}`);
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: string[] = [];
      for (const item of comments) {
        const comment: ICommentDocument = Helpers.parseJson(item);
        list.push(comment.username);
      }

      const response: ICommentNameList = {
        count: commentsCount,
        names: list,
      };
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleCommentFromCache(postId: string, commentId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const comments: string[] = await this.client.LRANGE(`comments:${postId}`, 0, -1);
      const list: ICommentDocument[] = [];
      for (const item of comments) {
        list.push(Helpers.parseJson(item));
      }
      const result: ICommentDocument | undefined = find(list, (listItem: ICommentDocument) => {
        return listItem._id === commentId;
      });

      return result || null;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
