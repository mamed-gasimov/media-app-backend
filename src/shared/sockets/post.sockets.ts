import { Server, Socket } from 'socket.io';

import { IReactionDocument } from '@reaction/interfaces/reaction.interface';
import { ICommentDocument } from '@comment/interfaces/comments.interface';

export let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen() {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reaction', (reactionData: IReactionDocument) => {
        this.io.emit('update reaction', reactionData);
      });

      socket.on('comment', (commentData: ICommentDocument) => {
        this.io.emit('update comment', commentData);
      });
    });
  }
}
