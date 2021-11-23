import * as Discord from 'discord.js';
import { ControllerBase } from '../classes/controller-base.class';

export const CONTROLLER_METADATA_ID = '_CONTROLLER_METADATA_ID';

export interface ControllerMetadata {
  commands: string[];
  channelWhitelist?: string[];
  onlyGuild?: boolean;
  onlyDM?: boolean;
}

export function Controller(data: ControllerMetadata) {
  return function (target: new (message: Discord.Message, args: string[]) => ControllerBase) {
    const metadataValue = {
      channelWhitelist: null,
      onlyGuild: false,
      onlyDM: false,
      ...data,
    };

    Reflect.defineMetadata(CONTROLLER_METADATA_ID, metadataValue, target);
  };
}
