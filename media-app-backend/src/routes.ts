import { Application } from 'express';

import { authRoutes } from '@auth/routes/authRoutes';
import { currentUserRoutes } from '@auth/routes/currentUserRoutes';
import { authMiddleware } from '@global/helpers/authMiddleware';
import { postRoutes } from '@post/routes/postRoutes';
import { reactionRoutes } from '@reaction/routes/reactionRoutes';
import { serverAdapter } from '@service/queues/base.queue';
import { commentRoutes } from '@comment/routes/commentRoutes';
import { followerRoutes } from '@follower/routes/followerRoutes';
import { blockedUsersRoutes } from '@blocked/routes/blockedUsersRoutes';
import { notificationRoutes } from '@notification/routes/notificationRoutes';
import { imageRoutes } from '@image/routes/imageRoutes';

const BASE_PATH = '/api';

const applicationRoutes = (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, blockedUsersRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes());
  };

  routes();
};

export default applicationRoutes;
