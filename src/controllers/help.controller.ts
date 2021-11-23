import { ControllerBase } from '../classes/controller-base.class';
import * as Discord from 'discord.js';
import { COMMANDS_DATA } from '../data/commands.data';
import { Controller } from '../decorators/controller.decorator';
import { Channels } from '../constants/channels.constants';

@Controller({
  commands: ['помощь'],
  channelWhitelist: [Channels.Bot],
})
export class HelpController extends ControllerBase {
  public processCommand(): void {
    const rich = new Discord.MessageEmbed()
      .setTitle('Список доступных комманд')
      .setDescription(COMMANDS_DATA.map(({ name, description }) => `**!${name}** - ${description}`).join('\n'));
    this.message.reply({
      embeds: [rich],
    });
  }
}
