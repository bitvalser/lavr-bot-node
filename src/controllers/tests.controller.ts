import * as Discord from 'discord.js';
import { emitter, redis } from '..';
import { ControllerBase } from '../classes/controller-base.class';
import { MessageSelector } from '../classes/message-selector.class';
import { TestSession } from '../classes/tests/test-session.class';
import { Controller } from '../decorators/controller.decorator';
import { getTestAnswer } from '../helpers/get-test-answer';
import { splitEmbedsChunks } from '../helpers/split-embeds';
import { ITestAnswer } from '../interfaces/test-answer.interfface';
import { ITestQuestion } from '../interfaces/test-question.interface';
import { TestsDataService } from '../services/test-data.service';
import { TestsService } from '../services/test.service';

@Controller({
  commands: ['тест'],
  onlyDM: true,
})
export class TestsController extends ControllerBase {
  private testsService: TestsService = TestsService.getInstance();
  private testsDataService: TestsDataService = TestsDataService.getInstance();

  private showTestResult(test, questions: ITestQuestion[], result): Promise<any> {
    if (test && questions && result) {
      return this.message
        .reply({
          embeds: [
            new Discord.MessageEmbed().setTitle(test.title).addFields([
              {
                inline: false,
                name: 'Ваш результат',
                value: `${result.points}`,
              },
            ]),
          ],
        })
        .then(() =>
          Promise.all(
            splitEmbedsChunks(
              result.answers.map((answer, i) => ({
                inline: false,
                name: `${questions[i].text}\t${((correctFactor) => {
                  if (questions[i].value === 0) return '✅';
                  if (correctFactor === 1) return '✅';
                  else if (correctFactor === 0) return '❌';
                  else return '❎';
                })(answer.correctFactor)}`,
                value: `${getTestAnswer(questions[i], answer)}${
                  questions[i]?.comment && answer.correctFactor !== 1 ? `\t*(${questions[i].comment})*` : ''
                }`,
              }))
            ).map((data) => {
              this.message.channel.send({
                embeds: data,
              });
            })
          )
        );
    } else {
      return this.message.reply('Вы ещё не прошли этот тест.');
    }
  }

  private getTestData(testName: string): Promise<[any, ITestQuestion[], any]> {
    return this.testsService
      .getTestByName(testName)
      .then((data) =>
        data
          ? Promise.all([
              Promise.resolve(data),
              this.testsService.getTestQuestions(data.id),
              this.testsService.getTestUserResult(data.id, this.message.author.id),
            ])
          : Promise.resolve([null, null, null])
      );
  }

  private startTest(test, questions: ITestQuestion[], results, answers: ITestAnswer[] = []): Promise<void> {
    const session = new TestSession(this.message.channel, questions, answers);
    const sessionListener = (data) => {
      if (data.user === this.message.author.id && data.event === 'stop') {
        session.stop();
      }
    };
    emitter.on(`tests:${test.title}`, sessionListener);
    return session
      .start({
        onUpdate: (answers) => {
          redis.hSet(`tests:${test.title}`, this.message.author.id, JSON.stringify(answers));
        },
      })
      .then((answers) => {
        this.message.reply('Тест завершён!');
        redis.hDel(`tests:${test.title}`, this.message.author.id);
        if (answers) {
          this.message.channel.sendTyping();
          const points = answers.reduce((acc, answer, i) => acc + answer.correctFactor * questions[i].value, 0);
          return Promise.resolve()
            .then(() => {
              if (!results || results.points < points) {
                return this.testsService.saveTestResult(
                  test.id,
                  this.message.author.id,
                  this.message.author.username,
                  answers,
                  points
                );
              } else if (results) {
                return this.testsService
                  .updateTestResultAttempt(test.id, this.message.author.id)
                  .then(() =>
                    this.message.reply('Так как ваш прошлый результат был лучше, то эта попытка не будет сохранена.')
                  );
              }
              return Promise.resolve();
            })
            .then(() =>
              this.showTestResult(test, questions, {
                answers,
                points,
              })
            );
        } else if (!results) {
          this.testsService
            .saveTestResult(test.id, this.message.author.id, this.message.author.username, [], 0)
            .then(() =>
              this.showTestResult(test, questions, {
                answers: [],
                points: 0,
              })
            );
        } else {
          this.testsService
            .updateTestResultAttempt(test.id, this.message.author.id)
            .then(() =>
              this.message.reply('Так как ваш прошлый результат был лучше, то эта попытка не будет сохранена.')
            );
        }
      })
      .catch(() => {
        this.message.reply('Тест был остановлен!');
      })
      .finally(() => {
        emitter.removeListener(`tests:${test.title}`, sessionListener);
        this.testsDataService.removeSession(this.message.author.id);
      });
  }

  public processCommand(): void {
    const commandName = this.args[0];
    switch (commandName) {
      case 'старт': {
        const testName = this.args?.[1];
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        this.message.channel.sendTyping();
        this.getTestData(testName).then(([test, questions, results]) => {
          if (results && test.isOneQuota) {
            this.message.reply('Вы уже прошли этот тест!');
            return;
          }
          if (questions?.length > 0) {
            redis.hGet(`tests:${testName}`, this.message.author.id).then((result) => {
              if (!result) {
                if (!this.testsDataService.addSession(this.message.author.id, testName)) {
                  this.message.reply(
                    `У вас уже запущен тест ${this.testsDataService.getSession(this.message.author.id)}`
                  );
                  return;
                }
                const startSession = new MessageSelector(this.message.channel, 45 * 1000);
                startSession.onConfirm(() => {
                  startSession.reset();
                  this.startTest(test, questions, results);
                });
                startSession.onEnd(() => {
                  this.testsDataService.removeSession(this.message.author.id);
                  this.message.reply('Вы не успели подтвердить начало теста, попробуйте ещё раз :(');
                });
                startSession.runSelector(
                  {
                    embed: new Discord.MessageEmbed()
                      .setTitle(test.title)
                      .setDescription(
                        `${test.description}\n\nНа каждый вопрос у вас есть 3 минуты чтобы ответить, если вы не успеете ответить то тест закроется и вам будет засчитана провальная попытка!!!\nНо вы можете поставить тест на паузу используя команду "!тест пауза ${test.title}".\n*(У вас есть 45 секунд чтобы начать тест)*`
                      )
                      .setFields([
                        {
                          inline: true,
                          name: 'Количество вопросов',
                          value: String(questions.length),
                        },
                        {
                          inline: true,
                          name: 'Примерная длительность',
                          value: `${test.time} мин.`,
                        },
                        {
                          inline: true,
                          name: 'Использовано попыток',
                          value: `${results?.attempts || 0}`,
                        },
                      ])
                      .setFooter(`${MessageSelector.OK_ITEM} Начать тест?`),
                  },
                  { itemsSize: 0, withOk: true }
                );
              } else {
                this.message.reply(
                  `У вас уже актвный тест, используйте команду "!тест продолжить ${testName}" чтобы продолжить.\nЛибо команду "!тест закончить ${testName}" чтобы удалить активную сессию`
                );
              }
            });
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
            return this.getTestData(testName).then(([test, questions, result]): any => {
              this.showTestResult(test, questions, result);
            });
          } else {
            this.message.reply('Такого теста не существует!');
          }
        });
        break;
      }
      case 'закончить': {
        const testName = this.args?.[1];
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        redis.hDel(`tests:${testName}`, this.message.author.id).then(() => this.message.reply('Сессия была удалена'));
        break;
      }
      case 'продолжить': {
        const testName = this.args?.[1];
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        const currentSession = this.testsDataService.getSession(this.message.author.id);
        if (currentSession) {
          this.message.reply(`У вас уже запущен тест ${currentSession}`);
          return;
        }
        redis.hGet(`tests:${testName}`, this.message.author.id).then((result) => {
          if (result) {
            this.getTestData(testName).then((data) => {
              this.testsDataService.addSession(this.message.author.id, testName);
              this.startTest(...data, JSON.parse(result));
            });
          } else {
            this.message.reply('Не найдено активных сессий!');
          }
        });
        break;
      }
      case 'пауза': {
        const testName = this.args?.[1];
        if (!testName) {
          this.message.reply('Введите название теста.');
          return;
        }
        redis.hGet(`tests:${testName}`, this.message.author.id).then((result) => {
          if (result) {
            emitter.emit(`tests:${testName}`, { user: this.message.author.id, event: 'stop' });
          } else {
            this.message.reply('У вас нет активных тестов');
          }
        });
        break;
      }
      default:
        this.message.reply('Неизвестная команда!');
    }
  }
}
