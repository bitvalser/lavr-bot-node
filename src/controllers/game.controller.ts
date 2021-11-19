import * as Discord from 'discord.js';
import * as jwt from 'jsonwebtoken';
import { ControllerBase } from '../classes/controller.base';
import { DiscordPaginator } from '../classes/discord-paginator.class';
import { GameItemTechnique } from '../classes/game/game-item-technique.class';
import { GameItem } from '../classes/game/game-item.class';
import {
  CONFIRM_EMOJI,
  COUNT_REACTION,
  GameLevelUp,
  GamePlayer,
  SKILLS,
} from '../classes/game/game-player.class';
import { JsonSerialize } from '../classes/game/json-serialize.class';
import { getPlayerById, getShopItems, getUserInventory, savePlayer } from '../services/game.service';

const RESET_EMOJI = '🔄';
const SHOP_SECTIONS: {
  [key: string]: string;
} = {
  ['техники']: 'technicians',
};

const SHOP_SECTIONS_CLASS: {
  [key: string]: any;
} = {
  technicians: GameItemTechnique,
};

export class GameController extends ControllerBase {
  public processMessage(): void {
    const command = this.args[0];

    const getPlayer = () => {
      this.message.channel.sendTyping();
      return getPlayerById(this.message.author.id).then((data) => {
        console.log(data);
        if (!data) {
          this.message.reply('Игрок не найден.');
          return null;
        }
        return JsonSerialize.fromJsonState(GamePlayer, data);
      });
    };

    switch (command) {
      case 'создать':
        getPlayerById(this.message.author.id).then((data) => {
          if (data) {
            this.message.reply('Игрок уже создан.');
            return;
          }
          const player = GamePlayer.createNew(this.message.author.id);
          this.message.channel.sendTyping();
          savePlayer(player).then(() => {
            this.message.reply('Игрок создан!');
          });
        });
        break;
      case 'статус':
        getPlayer().then((player) => {
          if (player) {
            this.message.reply({
              embeds: [player.getRichStatus()],
            });
          }
        });
        break;
      case 'инвентарь':
        getPlayer().then((player) => {
          if (player) {
            getUserInventory(player.id).then((items) => {
              if (items.length > 0) {
                this.message.reply({
                  embeds: items.map((item: any) =>
                    JsonSerialize.fromJsonState<GameItem>(
                      SHOP_SECTIONS_CLASS[item.section],
                      item
                    ).getRichInventoryCard()
                  ),
                });
              } else {
                this.message.reply({
                  content: 'Инвентарь пуст',
                });
              }
            });
          }
        });
        break;
      case 'магазин':
        if (this.args.length > 1) {
          const section = SHOP_SECTIONS[this.args[1]];
          if (section) {
            this.message.channel.sendTyping();
            const authToken = jwt.sign({ userId: this.message.author.id }, process.env.SECRET);
            getShopItems(section).then((data) => {
              const items: GameItemTechnique[] = data.map((item: any) =>
                JsonSerialize.fromJsonState(GameItemTechnique, item)
              );
              const paginator = new DiscordPaginator(this.message.channel);
              paginator.runPaginator(items.map((item) => item.getRichShopCard(authToken)));
            });
          } else {
            this.message.reply('Некорректная секция');
          }
        } else {
          this.message.reply('Некорректаня команда');
        }
        break;
      case 'повышение':
        getPlayer().then((player) => {
          if (player) {
            this.message
              .reply({
                embeds: [player.getRichLevelUp()],
              })
              .then((message) => {
                let skills: GameLevelUp = {};

                const updateMessage = () => {
                  message.edit({
                    embeds: [player.getRichLevelUp(skills)],
                  });
                };

                const reactionCollector = message.createReactionCollector({
                  dispose: true,
                  time: 3 * 60 * 1000,
                  filter: (reaction, user) =>
                    !user.bot &&
                    (COUNT_REACTION.includes(reaction.emoji.name) ||
                      [RESET_EMOJI, CONFIRM_EMOJI].includes(reaction.emoji.name)),
                });
                reactionCollector.on('end', () => {
                  message.delete();
                });
                const onReaction = (data: Discord.MessageReaction) => {
                  const skillIdx = COUNT_REACTION.findIndex((reaction) => reaction === data.emoji.name);
                  if (skillIdx >= 0) {
                    const skill = SKILLS[skillIdx];
                    skills[skill] = skills[skill] !== undefined ? skills[skill] + 1 : 1;
                    updateMessage();
                  }
                  if (data.emoji.name === RESET_EMOJI) {
                    skills = {};
                    updateMessage();
                  }
                  if (data.emoji.name === CONFIRM_EMOJI) {
                    if (!player.canLevelUp(skills)) {
                      player.levelUp(skills);
                      reactionCollector.stop();
                      savePlayer(player).then(() => {
                        this.message.reply('Уровень повышен!');
                      });
                    }
                  }
                };
                reactionCollector.on('collect', onReaction);
                reactionCollector.on('remove', onReaction);
                [...COUNT_REACTION, RESET_EMOJI, CONFIRM_EMOJI].forEach((reaction) => message.react(reaction));
              });
          }
        });
        break;
      default:
        this.message.reply('Неизвестная комманда');
    }
  }
}
