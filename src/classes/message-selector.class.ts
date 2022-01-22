import * as Discord from 'discord.js';

const DEFAULT_TIMEOUT = 3 * 60 * 1000;

export class MessageSelector {
  public static SELECT_ITEMS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  public static OK_ITEM = '🆗';
  private channel: Discord.TextBasedChannels;
  private timeout: number;
  private message: Discord.Message = null;
  private collector: Discord.ReactionCollector;
  private _onConfirm: () => void;
  private _onSelect: (option: number) => void;

  constructor(channel: Discord.TextBasedChannels, timeout: number = DEFAULT_TIMEOUT) {
    this.channel = channel;
    this.timeout = timeout;
  }

  public onSelect(callback: (option: number) => void): void {
    this._onSelect = callback;
  }

  public onConfirm(callback: () => void): void {
    this._onConfirm = callback;
  }

  public updateMessage({
    embed,
    content,
  }: {
    embed?: Discord.MessageEmbed;
    content?: string;
  }): Promise<Discord.Message<boolean>> {
    return this.message?.edit({ embeds: [embed], content });
  }

  public runSelector(
    { embed, content }: { embed?: Discord.MessageEmbed; content?: string },
    { itemsSize, withOk }: { itemsSize: number; withOk?: boolean }
  ): void {
    this.channel.send({ embeds: [embed], content }).then((message) => {
      this.message = message;
      this.collector = message.createReactionCollector({
        dispose: true,
        time: this.timeout,
        filter: (reaction, user) =>
          !user.bot && [...MessageSelector.SELECT_ITEMS, MessageSelector.OK_ITEM].includes(reaction.emoji.name),
      });
      this.collector.on('end', () => {
        message.delete();
      });
      const onReaction = (data: Discord.MessageReaction) => {
        if (data.emoji.name === MessageSelector.OK_ITEM) {
          this._onConfirm();
        } else {
          this._onSelect(MessageSelector.SELECT_ITEMS.indexOf(data.emoji.name));
        }
      };
      this.collector.on('collect', onReaction);
      this.collector.on('remove', onReaction);
      Array.from({ length: itemsSize })
        .map((_, i) => MessageSelector.SELECT_ITEMS[i])
        .forEach((reaction) => message.react(reaction));
      if (withOk) {
        message.react(MessageSelector.OK_ITEM);
      }
    });
  }

  public reset(): Promise<boolean> {
    if (this.message) {
      this.collector.removeAllListeners();
      this.collector.stop();
      return Promise.resolve(true);
      // return Promise.all(
      //   this.message.reactions.cache
      //     .map((reaction) => reaction.users.cache.filter((user) => user.bot).map(() => reaction.remove()))
      //     .flat()
      // ).then(() => true);
    } else {
      return Promise.resolve(false);
    }
  }
}
