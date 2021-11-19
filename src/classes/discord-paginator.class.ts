import * as Discord from 'discord.js';

const RIGHT_EMOJI = '➡️';
const LEFT_EMOJI = '⬅️';

export class DiscordPaginator {
  public size: number;
  public channel: Discord.TextBasedChannels;

  constructor(channel: Discord.TextBasedChannels, size: number = 3) {
    this.size = size;
    this.channel = channel;
  }

  public runPaginator(items: Discord.MessageEmbed[]): void {
    let page = 0;
    const pages = Math.ceil(items.length / this.size);

    const getContent = () => ({
      content: `Страница ${page + 1}/${pages}`,
      embeds: items.slice(page * this.size, page * this.size + this.size),
    });

    this.channel.send(getContent()).then((message) => {
      const reactionCollector = message.createReactionCollector({
        dispose: true,
        time: 3 * 60 * 1000,
        filter: (reaction, user) => !user.bot && [RIGHT_EMOJI, LEFT_EMOJI].includes(reaction.emoji.name),
      });
      reactionCollector.on('end', () => {
        message.delete();
      });
      const onReaction = (data: Discord.MessageReaction) => {
        if (data.emoji.name === LEFT_EMOJI) {
          page = page - 1 <= 0 ? 0 : page - 1;
        }
        if (data.emoji.name === RIGHT_EMOJI) {
          page = page + 1 > pages ? pages : page + 1;
        }
        message.edit(getContent());
      };
      reactionCollector.on('collect', onReaction);
      reactionCollector.on('remove', onReaction);
      [LEFT_EMOJI, RIGHT_EMOJI].forEach((reaction) => message.react(reaction));
    });
  }
}
