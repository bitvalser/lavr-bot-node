import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { GamePlayer } from '../../classes/game/game-player.class';
import { JsonSerialize } from '../../classes/game/json-serialize.class';
import { getPlayerById } from '../../services/game.service';

export const ensureToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = (req.query?.token as string) || req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.SECRET, (err, data) => {
      if (err) {
        res.sendStatus(401);
      } else {
        req.userId = data.userId;
        getPlayerById(data.userId).then((user) => {
          req.user = JsonSerialize.fromJsonState(GamePlayer, user);
          next();
        });
      }
    });
  } else {
    res.sendStatus(401);
  }
};
