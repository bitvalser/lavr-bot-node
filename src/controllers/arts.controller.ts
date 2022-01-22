import * as Discord from 'discord.js';
import { ControllerBase } from '../classes/controller-base.class';
import { Channels } from '../constants/channels.constants';
import { Controller } from '../decorators/controller.decorator';

@Controller({
  commands: ['арт'],
  onlyDM: true,
})
export class ArtsController extends ControllerBase {
  public processCommand(): void {
    const commandName = this.args[0];
    switch (commandName) {
      case 'добавить':
        const artChannel = this.message.client.channels.cache.get(Channels.Arts);
        if (artChannel && artChannel.isText()) {
          const attachments = Array.from(this.message.attachments.values()).filter((item) =>
            item.contentType.startsWith('image')
          );
          if (attachments.length > 0) {
            this.message.channel.sendTyping();
            artChannel
              .send({
                embeds: [
                  new Discord.MessageEmbed({
                    title: this.args.splice(1).join(' ') || null,
                    author: {
                      name: this.message.author.username,
                      iconURL: this.message.author.avatarURL(),
                    },
                    fields: [
                      {
                        name: 'Отправил арт',
                        value: `<@${this.message.author.id}>`,
                        inline: true,
                      },
                    ],
                  }),
                ],
                files: attachments.map((item) => item.url),
              })
              .then((newMessage) =>
                newMessage.startThread({
                  name: `Обсуждение арта от ${this.message.author.username}`,
                })
              )
              .then(() => {
                this.message.reply('Арт был успешно создан!');
              });
          } else {
            this.message.reply('Сообщение не имеет ни одного изображения');
          }
        } else {
          this.message.reply('Что-то пошло не так :(');
        }
        break;
      case 'инструкция':
        this.message.reply({
          embeds: [
            new Discord.MessageEmbed({
              title: 'Инструция по добавлению арта',
              description: [
                'Прежде всего введите комманду "!арт добавить", но пока что не отправляйте сообщение.',
                'После этого прекрепите прямо к этому же сообщению ваш арт (допустимо прикреплять несколько изображений).',
                'Как только вы добавили арт, то отправляйте сообщение.',
                'Если вы хотите добавить небольшое описание или заголвок, то просто после комманды "!арт добавить" введите информацию об арте.',
                'Пример: "!арт добавить Арт Евы и Лейлы"',
                'Имейте в виду что заголовок не должен быть слишком длинным, для этого есть ветка.',
                'Для дополнительной информации в канале с артом также будем автоматически созданна ветка',
              ].join('\n'),
            }),
          ],
        });
        break;
      default:
        this.message.reply('Неизвестная комманда');
    }
  }
}
