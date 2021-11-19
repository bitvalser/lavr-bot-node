import { Request, Response } from 'express';
import { client } from '../..';
import { addItemToInventory, getShopItemById, savePlayer } from '../../services/game.service';

export class AppGameController {
  constructor() {
    this.buyItem = this.buyItem.bind(this);
  }

  public buyItem(req: Request, res: Response): void {
    const { section, id } = req.query;
    getShopItemById(section as string, id as string).then((data) => {
      if (req.user.money < data.price) {
        res.write('<h1>Not enough money</h1>');
        res.end();
      } else {
        req.user.money -= data.price;
        savePlayer(req.user)
          .then(() => addItemToInventory(req.userId, data))
          .then(() => {
            client.users.fetch(req.userId).then((user) =>
              user.send({
                content: `Предмет "${data.title}" был добавлен в ваш инвентарь!`,
              })
            );
            res.write('<h1>Item was purchased!</h1>');
            res.end();
          });
      }
    });
  }
}
