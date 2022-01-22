import * as Discord from 'discord.js';
import { ControllerBase } from '../classes/controller-base.class';
import { MessageSelector } from '../classes/message-selector.class';
import { TestSession } from '../classes/tests/test-session.class';
import { Controller } from '../decorators/controller.decorator';
import { getTestAnswer } from '../helpers/get-test-answer';
import { TestsService } from '../services/test.service';

@Controller({
  commands: ['тест'],
  onlyDM: true,
})
export class TestsController extends ControllerBase {
  private testsService: TestsService = TestsService.getInstance();

  private showTestResult(testId: string): Promise<any> {
    return Promise.all([
      this.testsService.getTestById(testId),
      this.testsService.getTestQuestions(testId),
      this.testsService.getTestUserResult(testId, this.message.author.id),
    ]).then(([test, questions, result]) => {
      console.log(test, questions, result);
      if (test && questions && result) {
        return this.message.reply({
          embeds: [
            new Discord.MessageEmbed().setTitle(test.title).addFields([
              {
                inline: false,
                name: 'Ваш результат',
                value: `${result.points}/${questions.reduce((acc, question) => acc + question.value, 0)}`,
              },
              ...result.answers.map((answer, i) => ({
                inline: false,
                name: `${questions[i].text}\t${((correctFactor) => {
                  if (correctFactor === 1) return '✅';
                  else if (correctFactor === 0) return '❌';
                  else return '❎';
                })(answer.correctFactor)}`,
                value: getTestAnswer(questions[i], answer),
              })),
            ]),
          ],
        });
      } else {
        return this.message.reply('Вы ещё не прошли этот тест.');
      }
    });
  }

  public processCommand(): void {
    const commandName = this.args[0];
    switch (commandName) {
      case 'старт': {
        const testName = this.args?.[1];
        console.log(testName);
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        this.message.channel.sendTyping();
        this.testsService
          .getTestByName(testName)
          .then((data) =>
            data
              ? Promise.all([Promise.resolve(data), this.testsService.getTestQuestions(data.id)])
              : Promise.resolve([null, null])
          )
          .then(([test, questions]) => {
            if (questions?.length > 0) {
              const startSession = new MessageSelector(this.message.channel, 45 * 1000);
              startSession.onConfirm(() => {
                startSession.reset();
                const session = new TestSession(this.message.channel, questions);
                session
                  .start()
                  .then((answers) => {
                    this.message.channel.sendTyping();
                    const points = answers.reduce(
                      (acc, answer, i) => acc + answer.correctFactor * questions[i].value,
                      0
                    );
                    return this.testsService.saveTestResult(
                      test.id,
                      this.message.author.id,
                      this.message.author.username,
                      answers,
                      points
                    );
                  })
                  .then(() => this.showTestResult(test.id));
              });
              startSession.runSelector(
                {
                  embed: new Discord.MessageEmbed()
                    .setTitle(test.title)
                    .setDescription(
                      `${test.description}\n\nНа каждый вопрос у вас есть 3 минуты чтобы ответить, если вы не успеете ответить то тест закроется и вам придётся начинать его сначала!!!\n*(У вас есть 45 секунд чтобы начать тест)*`
                    )
                    .setFields([
                      {
                        inline: true,
                        name: 'Количество вопросов',
                        value: String(questions.length),
                      },
                    ])
                    .setFooter(`${MessageSelector.OK_ITEM} Начать тест?`),
                },
                { itemsSize: 0, withOk: true }
              );
            } else {
              this.message.reply('Такого теста не существует!');
            }
          });
        break;
      }
      case 'результат': {
        const testName = this.args?.[1];
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        this.message.channel.sendTyping();
        this.testsService.getTestByName(testName).then((data) => {
          if (data) {
            this.showTestResult(data.id);
          } else {
            this.message.reply('Такого теста не существует!');
          }
        });
        break;
      }
      default:
        this.message.reply('Неизвестная команда!');
    }
  }
}
