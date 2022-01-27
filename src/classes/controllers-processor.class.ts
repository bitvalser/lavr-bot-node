import * as Discord from 'discord.js';
import { ControllerBase } from './controller-base.class';
import { ControllerMetadata, CONTROLLER_METADATA_ID } from '../decorators/controller.decorator';

export class ControllerProcessor {
  private commandsControllerMap: {
    [command: string]: new (message: Discord.Message, args: string[]) => ControllerBase;
  } = {};

  public constructor(controllers: (new (message: Discord.Message, args: string[]) => ControllerBase)[]) {
    this.commandsControllerMap = controllers.reduce((acc, controller) => {
      const { commands } = Reflect.getOwnMetadata(CONTROLLER_METADATA_ID, controller) as ControllerMetadata;
      return {
        ...acc,
        ...commands.reduce(
          (acc, command) => ({
            ...acc,
            [command]: controller,
          }),
          {}
        ),
      };
    }, {});
  }

  public processMessage(message: Discord.Message): void {
    const commandName = message.content.substr(1).split(' ')[0];
    const args = message.content.replace(/\s+/g, ' ').split(' ').slice(1);
    const Controller = this.commandsControllerMap[commandName];
    if (Controller) {
      const { channelWhitelist, onlyDM, onlyGuild } = Reflect.getOwnMetadata(
        CONTROLLER_METADATA_ID,
        Controller
      ) as ControllerMetadata;
      const rules = [
        channelWhitelist === null || !message.guild || channelWhitelist.includes(message.channel.id),
        onlyDM === false || !message.guild,
        onlyGuild === false || Boolean(message.guild),
      ];
      if (onlyDM === true && message.guild) {
        message.reply({ content: 'Это команда работает только в личных сообщених!' });
      }
      if (rules.every(Boolean)) {
        new Controller(message, args).processCommand();
      }
    } else {
      message.reply('Неизвестная комманда');
    }
  }
}
