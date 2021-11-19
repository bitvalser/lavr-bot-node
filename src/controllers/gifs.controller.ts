import * as Discord from 'discord.js';
import { getGifs, getGifByName, createGif } from '../services/gifs.service';
import { ControllerBase } from '../classes/controller.base';

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const CREATE_ROLE_WHITELIST = [
  '699101609895919646',
  '701510217715941467',
  '699102550657466378',
  '699106829137084506',
  '699117653968551946',
  '699103792544743463',
  '796541702059589653',
];

export class GifsController extends ControllerBase {
  public processMessage(): void {
    const gifName = this.args[0];
    switch (gifName) {
      case 'список':
        this.message.channel.sendTyping();
        getGifs().then((characters) => {
          const rich = new Discord.MessageEmbed().setTitle('Список доступных гифок').setDescription(
            Object.keys(characters)
              .map((name) => `- ${name.replace(/_/g, '\\_')}`)
              .join('\n')
          );
          this.message.reply({
            embeds: [rich],
          });
        });
        break;
      case 'добавить':
        if (!this.message.guild) {
          this.message.reply('Команда доступна только в гильдии');
          break;
        }
        const roleId = this.message.guild?.members.cache.get(this.message.author.id)?.roles.highest.id || '';
        if (!CREATE_ROLE_WHITELIST.includes(roleId)) {
          this.message.reply('У вас нет прав на добавление гифки');
          break;
        }
        const name = this.args[1];
        const url = this.args[2];
        if (!name || !url) {
          this.message.reply('Имя или URL гифки не выбраны');
        } else if (!URL_REGEX.test(url)) {
          this.message.reply('Недействительная ссылка предоставлена');
        } else {
          this.message.channel.sendTyping();
          createGif(name, url).then(() => {
            this.message.reply(`Гифка с именем ${name} успешно создана!`);
          });
        }
        break;
      default:
        this.message.channel.sendTyping();
        getGifByName(gifName).then((gif) => {
          if (!gif) {
            this.message.reply(`Гифка с названием ${gifName} не найдена.`);
            return;
          }
          const attachment = new Discord.MessageAttachment(gif.url);
          this.message.reply({
            content: gif.id,
            embeds: [attachment],
          });
          this.message.delete();
        });
    }
  }
}
