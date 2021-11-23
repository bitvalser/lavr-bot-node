import { ControllerBase } from '../classes/controller-base.class';
import * as Discord from 'discord.js';
import { Controller } from '../decorators/controller.decorator';
import { Channels } from '../constants/channels.constants';

const JOKE_GIF_URL =
  'https://firebasestorage.googleapis.com/v0/b/lavr-bot.appspot.com/o/DMCW.gif?alt=media&token=23088aa7-f953-4588-a24e-36eee2f2a374';

@Controller({
  commands: ['когда_глава'],
  channelWhitelist: [Channels.Bot],
  onlyGuild: true,
})
export class WhenChapterController extends ControllerBase {
  public processCommand(): void {
    const gif = new Discord.MessageAttachment(JOKE_GIF_URL);
    this.message.reply({
      content: 'Когда автор сделает и редактор проверит :D',
      files: [gif],
    });
  }
}
