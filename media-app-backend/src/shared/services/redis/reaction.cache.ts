import { find } from 'lodash';

import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { IReactionDocument, IReactions } from '@reaction/interfaces/reaction.interface';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

const log = config.createLogger('reactionsCache');

export class ReactionsCache extends BaseCache {
  constructor() {
    super('reactionsCache');
  }

  public async savePostReactionToCache(
    postId: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    previousReaction?: string
  ) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        this.removePostReactionFromCache(postId, reaction.username, postReactions);
      }

      if (type) {
        await this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
        const dataToSave = ['reactions', JSON.stringify(postReactions)];
        await this.client.HSET(`posts:${postId}`, dataToSave);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removePostReactionFromCache(postId: string, username: string, postReactions: IReactions) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const multi = this.client.multi();
      const userPreviousReaction = this.getPreviousReaction(response, username);
      multi.LREM(`reactions:${postId}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      const dataToSave = ['reactions', JSON.stringify(postReactions)];
      await this.client.HSET(`posts:${postId}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  private getPreviousReaction(response: string[], username: string) {
    const list: IReactionDocument[] = [];
    for (const item of response) {
      list.push(Helpers.parseJson(item));
    }

    return find(list, (listItem) => listItem.username === username);
  }
}
