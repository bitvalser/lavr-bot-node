import * as Discord from 'discord.js';
import { GameItem } from './game-item.class';

export class GameItemTechnique extends GameItem {
  public readonly section: string = 'technicians';

  constructor(id: string, price: number, rank: number, description: string, title: string) {
    super(id, price, rank, description, title);
  }

  public getRichShopCard(authToken: string): Discord.MessageEmbed {
    return new Discord.MessageEmbed({
      title: this.title,
      description: this.description,
      author: {
        name: 'Техника',
      },
      fields: [
        {
          name: 'Ранг',
          value: this.getRank(),
          inline: true,
        },
        {
          name: 'Цена',
          value: this.price.toString(),
          inline: true,
        },
        {
          name: '⬥======',
          value: `[Купить](${process.env.BASE_URL}/game/buy-item?token=${authToken}&section=${this.section}&id=${this.id})`,
        },
      ],
    }).setColor(this.getRankColor() as Discord.ColorResolvable);
  }

  public getRichInventoryCard(): Discord.MessageEmbed {
    return new Discord.MessageEmbed({
      title: this.title,
      description: this.description,
      author: {
        name: 'Техника',
      },
      fields: [
        {
          name: 'Ранг',
          value: this.getRank(),
          inline: true,
        },
      ],
    }).setColor(this.getRankColor() as Discord.ColorResolvable);
  }
}
