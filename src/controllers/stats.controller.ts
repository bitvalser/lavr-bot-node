import * as Discord from 'discord.js';
import { splitFields } from '../helpers/split-fields';
import { getStatByName, getStats } from '../services/stats.service';
import { ControllerBase } from './controller.base';

export class StatsController extends ControllerBase {
  public processMessage(): void {
    const charName = this.args[0];
    switch (charName) {
      case 'список':
        this.message.channel.startTyping();
        getStats().then((stats) => {
          this.message.channel.stopTyping();
          const rich = new Discord.MessageEmbed().setTitle('Список доступных характеристик').setDescription(
            Object.entries(stats)
              .map(([name, { description }]: any) => `- **${name}** - ${description}`)
              .join('\n')
          );
          this.message.reply(rich);
        });
        break;
      default:
        this.message.channel.startTyping();
        getStatByName(charName).then((stat) => {
          this.message.channel.stopTyping();
          if (!stat) {
            this.message.reply(`Характеристка с названием ${charName} не найден.`);
            return;
          }
          const fields = stat.fields.map((field: any) => {
            return {
              ...field,
              value: field.value
                ? field.value
                    .replace(/;\s/g, ';')
                    .split(';')
                    .map((str: string) => (str.length > 1 ? `⬥ ${str[0].toUpperCase()}${str.substr(1)}` : str))
                    .join('\n')
                : `**${'='.repeat(field.name.length)}**`,
            };
          });

          console.log(splitFields(fields));
          const rich = new Discord.MessageEmbed()
            .setTitle(stat.name)
            .addFields(...splitFields(fields))
            .setColor(stat.color);
          this.message.reply(rich);
        });
    }
  }
}
