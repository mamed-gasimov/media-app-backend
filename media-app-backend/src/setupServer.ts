import { createAdapter } from '@socket.io/redis-adapter';
import compression from 'compression';
import cookieSession from 'cookie-session';
import cors from 'cors';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import HTTP_STATUS from 'http-status-codes';
import { createClient } from 'redis';
import { Server } from 'socket.io';

import { CustomError, IErrorResponse } from '@global/helpers/errorHandler';
import { config } from '@root/config';
import applicationRoutes from '@root/routes';
import { SocketIOPostHandler } from '@socket/post.sockets';
import { SocketIOFollowerHandler } from '@socket/follower.sockets';
import { SocketIOUserHandler } from '@socket/user.sockets';
import { SocketIONotificationHandler } from '@socket/notification.sockets';
import { SocketIOImageHandler } from '@socket/image.sockets';
import { SocketIOChatHandler } from '@socket/chat.sockets';

const SERVER_PORT = 8000;
const log = config.createLogger('server');

export class AppServer {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start() {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application) {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE as string, config.SECRET_KEY_TWO as string],
        maxAge: 24 * 7 * 3600 * 1000,
        secure: config.NODE_ENV !== 'development',
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      })
    );
  }

  private standardMiddleware(app: Application) {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application) {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application) {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} is not found!` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application) {
    try {
      const httpServer = new http.Server(app);
      const socketIO = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      },
    });

    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server) {
    log.info(`Server has started with process ${process.pid}.`);

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server is running on PORT ${SERVER_PORT}!`);
    });
  }

  private socketIOConnections(io: Server) {
    const socketIOPostHandler = new SocketIOPostHandler(io);
    const socketIOFollowerHandler = new SocketIOFollowerHandler(io);
    const socketIOUserHandler = new SocketIOUserHandler(io);
    const socketIOChatHandler = new SocketIOChatHandler(io);
    const socketIONotificationHandler = new SocketIONotificationHandler();
    const socketIOImageHandler = new SocketIOImageHandler();

    socketIOPostHandler.listen();
    socketIOFollowerHandler.listen();
    socketIOUserHandler.listen();
    socketIOChatHandler.listen();
    socketIONotificationHandler.listen(io);
    socketIOImageHandler.listen(io);
  }
}
