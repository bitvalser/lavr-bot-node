import { Router } from 'express';
import { AppGameController } from '../controllers/game.controller';
import { catchRoute } from '../core/catch-route';
import { ensureToken } from '../core/ensure-token';

export const appGameRouter = Router();
const appGameController = new AppGameController();

appGameRouter.get('/buy-item', [ensureToken], catchRoute(appGameController.buyItem));
