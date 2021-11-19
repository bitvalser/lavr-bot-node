import * as Discord from 'discord.js';
import { splitFields } from '../helpers/split-fields';
import { getCharacterByName, getCharacters } from '../services/character.service';
import { ControllerBase } from '../classes/controller.base';

export class CharacterController extends ControllerBase {
  public processMessage(): void {
    const charName = this.args.join(' ');
    switch (charName) {
      case 'список':
        this.message.channel.sendTyping();
        getCharacters().then((characters) => {
          const rich = new Discord.MessageEmbed().setTitle('Список доступных персонажей').setDescription(
            Object.keys(characters)
              .map((name) => `- ${name}`)
              .join('\n')
          );
          this.message.reply({
            embeds: [rich],
          });
        });
        break;
      default:
        this.message.channel.sendTyping();
        getCharacterByName(charName).then((character) => {
          if (!character) {
            this.message.reply(`Персонаж с именем ${charName} не найден.`);
            return;
          }
          const rich = new Discord.MessageEmbed()
            .setTitle(character.name)
            .addFields(
              ...splitFields(
                character.fields.map((field: any) => ({
                  ...field,
                  value: field.value
                    .replace(/;\s/g, ';')
                    .split(';')
                    .map((str: string) => (str.length > 1 ? `⬥ ${str[0].toUpperCase()}${str.substr(1)}` : str))
                    .join('\n'),
                }))
              )
            )
            .setColor(character.color);
          this.message.reply({
            embeds: [rich],
          });
        });
    }
  }
}
