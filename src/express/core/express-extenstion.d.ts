import { GamePlayer } from '../../classes/game/game-player.class';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user: GamePlayer;
    }
  }
}
