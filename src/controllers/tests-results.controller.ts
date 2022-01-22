import * as Discord from 'discord.js';
import { ControllerBase } from '../classes/controller-base.class';
import { Controller } from '../decorators/controller.decorator';
import { TestsService } from '../services/test.service';
import firebase from 'firebase';

const RATING_MEDALS = ['🥇', '🥈', '🥉'];

@Controller({
  commands: ['тесты'],
})
export class TestsResultsController extends ControllerBase {
  private testsService: TestsService = TestsService.getInstance();

  public static handleRefreshRating(message: Discord.Message, testId: string): void {
    firebase
      .firestore()
      .collection('tests')
      .doc(testId)
      .get()
      .then((result) => result.data())
      .then((test) => {
        firebase
          .firestore()
          .collection('tests')
          .doc(testId)
          .collection('results')
          .orderBy('points', 'desc')
          .limit(10)
          .onSnapshot((snapshot) => {
            const data = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                } as any)
            );
            message.edit({
              embeds: [
                new Discord.MessageEmbed()
                  .setTitle(`Рейтинг теста "${test.title}" (Топ 10)`)
                  .setDescription(test.description)
                  .setFields(
                    data.map((user, i) => ({
                      inline: false,
                      name: `${i + 1} место ${RATING_MEDALS[i] || ''}`,
                      value: `<@${user.id}> ${user.points} очков`,
                    }))
                  ),
              ],
            });
          });
      });
  }

  public processCommand(): void {
    const commandName = this.args[0];
    switch (commandName) {
      case 'список':
        this.message.channel.sendTyping();
        this.testsService.getTests().then((tests) => {
          const rich = new Discord.MessageEmbed()
            .setTitle('Список доступных тестов')
            .setDescription(tests.map(({ title }) => `- ${title}`).join('\n'));
          this.message.reply({
            embeds: [rich],
          });
        });
        break;
      case 'рейтинг':
        const testName = this.args?.[1];
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        this.message.channel.sendTyping();
        this.testsService.getTestByName(testName).then((data) => {
          if (data) {
            this.testsService.getTestRating(data.id).then((users) => {
              const yourPosition = users.findIndex((item) => item.id === this.message.author.id);
              this.message.reply({
                embeds: [
                  new Discord.MessageEmbed()
                    .setTitle(`Рейтинг теста "${data.title}" (Топ 30)`)
                    .setDescription(data.description)
                    .setFields(
                      users.slice(0, 30).map((user, i) => ({
                        inline: false,
                        name: `${i + 1} место ${RATING_MEDALS[i] || ''}`,
                        value: `<@${user.id}> ${user.points} очков`,
                      }))
                    ),
                  ...(yourPosition >= 0
                    ? [
                        new Discord.MessageEmbed()
                          .setAuthor(this.message.author.username, this.message.author.avatarURL())
                          .setTitle(`Вы на ${yourPosition + 1} месте ${RATING_MEDALS[yourPosition] || ''}`)
                          .setFields([
                            {
                              name: 'Ваши очки',
                              value: String(users[yourPosition].points),
                            },
                          ]),
                      ]
                    : []),
                ],
              });
            });
          } else {
            this.message.reply('Такого теста не существует!');
          }
        });
        break;
      default:
        this.message.reply('Неизвестная команда!');
    }
  }
}
