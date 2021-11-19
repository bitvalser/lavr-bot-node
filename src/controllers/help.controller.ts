import { ControllerBase } from '../classes/controller.base';
import * as Discord from 'discord.js';
import { COMMANDS_DATA } from '../data/commands.data';

export class HelpController extends ControllerBase {
  public processMessage(): void {
    const rich = new Discord.MessageEmbed()
      .setTitle('Список доступных комманд')
      .setDescription(COMMANDS_DATA.map(({ name, description }) => `**!${name}** - ${description}`).join('\n'));
    this.message.reply({
      embeds: [rich],
    });
  }
}
