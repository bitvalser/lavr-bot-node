import * as Discord from 'discord.js';
import { GifsService } from '../services/gifs.service';
import { ControllerBase } from '../classes/controller-base.class';
import { Controller } from '../decorators/controller.decorator';
import { ChannelRole } from '../constants/channel-role.constants';

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
const CREATE_ROLE_WHITELIST = [
  ChannelRole.Wing,
  ChannelRole.Editor,
  ChannelRole.Admin,
  ChannelRole.Moderator,
  ChannelRole.Sponsor,
  ChannelRole.StrongReader,
  ChannelRole.OldAdmin,
];

@Controller({
  commands: ['гиф', 'gif'],
})
export class GifsController extends ControllerBase {
  private gifsService: GifsService = GifsService.getInstance();

  public processCommand(): void {
    const gifName = this.args[0];
    switch (gifName) {
      case 'список':
        this.message.channel.sendTyping();
        this.gifsService.getGifs().then((characters) => {
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
        if (!CREATE_ROLE_WHITELIST.includes(roleId as ChannelRole)) {
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
          this.gifsService.createGif(name, url).then(() => {
            this.message.reply(`Гифка с именем ${name} успешно создана!`);
          });
        }
        break;
      default:
        this.message.channel.sendTyping();
        this.gifsService.getGifByName(gifName).then((gif) => {
          if (!gif) {
            this.message.reply(`Гифка с названием ${gifName} не найдена.`);
            return;
          }
          const attachment = new Discord.MessageAttachment(gif.url);
          this.message.reply({
            content: gif.id,
            files: [attachment],
          });
          this.message.delete();
        });
    }
  }
}
