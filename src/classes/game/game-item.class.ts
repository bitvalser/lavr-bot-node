import * as Discord from 'discord.js';

export const ITEM_RANKS = ['FFF', 'FF', 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
export const ITEM_RANKS_COLOR = [
  '#fff',
  '#a8a8a8',
  '#a8a8a8',
  '#96ff9f',
  '#a7f1ff',
  '#1edafe',
  '#fe96e7',
  '#e569fb',
  '#f6ff37',
  '#fd8918',
  '#fd8918',
];

export abstract class GameItem {
  public id: string;
  public abstract readonly section: string;
  public price: number;
  public rank: number;
  public title: string;
  public description: string;

  constructor(id: string, price: number, rank: number, description: string, title: string) {
    this.id = id;
    this.price = price;
    this.rank = rank;
    this.description = description;
    this.title = title;
  }

  public getRank(): string {
    return ITEM_RANKS[this.rank];
  }

  public getRankColor(): string {
    return ITEM_RANKS_COLOR[this.rank];
  }

  public abstract getRichShopCard(authToken: string): Discord.MessageEmbed;
  public abstract getRichInventoryCard(): Discord.MessageEmbed;
}
