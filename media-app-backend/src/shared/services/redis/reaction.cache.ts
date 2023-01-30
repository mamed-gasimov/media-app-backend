import { ServerError } from '@global/helpers/errorHandler';
import { Helpers } from '@global/helpers/helpers';
import { IReactionDocument, IReactions, ReactionType } from '@reaction/interfaces/reaction.interface';
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
    type: ReactionType,
    previousReaction?: ReactionType
  ) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        await this.removePostReactionFromCache(postId, reaction.username, previousReaction);
      }

      if (type) {
        await this.client.LPUSH(`reactions:${postId}`, JSON.stringify(reaction));
        const postReactionsJson = await this.client.HGET(`posts:${postId}`, 'reactions');

        if (postReactionsJson) {
          const postReactions: IReactions = Helpers.parseJson(postReactionsJson);
          const changedPostPeactions = { ...postReactions, [type]: postReactions[type] + 1 };

          const dataToSave = ['reactions', JSON.stringify(changedPostPeactions)];
          await this.client.HSET(`posts:${postId}`, dataToSave);
        }
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removePostReactionFromCache(postId: string, username: string, previousReaction: ReactionType) {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const multi = this.client.multi();
      const userPreviousReaction = this.getPreviousReaction(response, username);
      multi.LREM(`reactions:${postId}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();

      const postReactionsJson = await this.client.HGET(`posts:${postId}`, 'reactions');

      if (postReactionsJson && previousReaction) {
        const postReactions: IReactions = Helpers.parseJson(postReactionsJson);

        const changedPostPeactions = {
          ...postReactions,
          [previousReaction]:
            postReactions[previousReaction] - 1 >= 0 ? postReactions[previousReaction] - 1 : 0,
        };

        const dataToSave = ['reactions', JSON.stringify(changedPostPeactions)];
        await this.client.HSET(`posts:${postId}`, dataToSave);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getReactionsFromCache(postId: string): Promise<IReactionDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = response.map((item) => Helpers.parseJson(item));
      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleReactionFromCache(
    postId: string,
    username: string
  ): Promise<IReactionDocument | undefined> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response = await this.client.LRANGE(`reactions:${postId}`, 0, -1);
      const list: IReactionDocument[] = response.map((item) => Helpers.parseJson(item));

      return list.find((listItem) => {
        return listItem?.postId === postId && listItem?.username === username;
      });
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

    return list.find((listItem) => listItem?.username === username);
  }
}
