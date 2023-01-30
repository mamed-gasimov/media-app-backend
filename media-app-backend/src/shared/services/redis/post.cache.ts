import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';

import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument, ISavePostToCache } from '@post/interfaces/post.interface';
import { IReactions } from '@reaction/interfaces/reaction.interface';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

const log = config.createLogger('postCache');

export type PostCacheMultiType =
  | string
  | number
  | Buffer
  | RedisCommandRawReply[]
  | IPostDocument
  | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache) {
    const { createdPost, currentUserId, key, uId } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      videoId,
      videoVersion,
      reactions,
      createdAt,
    } = createdPost;

    const firstList = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`,
    ];

    const secondList: string[] = [
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      JSON.stringify(reactions),
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'videoId',
      `${videoId}`,
      'videoVersion',
      `${videoVersion}`,
      'createdAt',
      `${createdAt}`,
    ];
    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postsCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi = this.client.multi();
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts:${key}`, dataToSave);
      const count = parseInt(postsCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi = this.client.multi();
      reply.forEach((value) => {
        multi.HGETALL(`posts:${value}`);
      });
      const replies = (await multi.exec()) as PostCacheMultiType;
      const posts: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;
        posts.push(post);
      }

      return posts;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalPostNumberFromCache() {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserPostsFromCache(key: string, uId: number) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });
      const multi = this.client.multi();
      reply.forEach((value) => {
        multi.HGETALL(`posts:${value}`);
      });
      const replies = (await multi.exec()) as PostCacheMultiType;
      const posts: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.parseJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.parseJson(`${post.createdAt}`)) as Date;
        posts.push(post);
      }

      return posts;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getTotalUserPostNumberFromCache(uId: number) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count = await this.client.ZCOUNT('post', uId, uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async deletePostFromCache(key: string, currentUserId: string) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postsCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      const count = parseInt(postsCount[0], 10) - 1;
      multi.HSET(`users:${currentUserId}`, ['postsCount', count]);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updatePostInCache(key: string, updatedPost: IPostDocument) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const {
        post,
        bgColor,
        imgId,
        imgVersion,
        videoId,
        videoVersion,
        feelings,
        gifUrl,
        privacy,
        profilePicture,
      } = updatedPost;
      const dataToSave = [
        'post',
        `${post}`,
        'bgColor',
        `${bgColor}`,
        'feelings',
        `${feelings}`,
        'privacy',
        `${privacy}`,
        'gifUrl',
        `${gifUrl}`,
        'imgVersion',
        `${imgVersion || ''}`,
        'imgId',
        `${imgId || ''}`,
        'profilePicture',
        `${profilePicture}`,
        'videoId',
        `${videoId || ''}`,
        'videoVersion',
        `${videoVersion || ''}`,
        'updatedAt',
        `${new Date()}`,
      ];

      await this.client.HSET(`posts:${key}`, dataToSave);
      const multi = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      const reply = (await multi.exec()) as PostCacheMultiType;
      const postReply = reply as IPostDocument[];
      postReply[0].commentsCount = Helpers.parseJson(`${postReply[0].commentsCount}`) as number;
      postReply[0].reactions = Helpers.parseJson(`${postReply[0].reactions}`) as IReactions;
      postReply[0].createdAt = new Date(Helpers.parseJson(`${postReply[0].createdAt}`)) as Date;
      postReply[0].updatedAt = new Date(Helpers.parseJson(`${postReply[0].updatedAt}`)) as Date;

      return postReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
