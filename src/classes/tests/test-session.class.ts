import * as Discord from 'discord.js';
import { getTestAnswer } from '../../helpers/get-test-answer';
import { ITestAnswer } from '../../interfaces/test-answer.interfface';
import { ITestQuestion } from '../../interfaces/test-question.interface';
import { MessageSelector } from '../message-selector.class';
import { MultiQuestion } from './multi-question.class';
import { SingleQuestion } from './single-question.class';
import { TestQuestion } from './test-question.class';
import { TextQuestion } from './text-question.class';

export class TestSession {
  private channel: Discord.TextBasedChannels;
  private questions: ITestQuestion[];
  private answers: ITestAnswer[];
  private _onEnd: (data: ITestAnswer[]) => void;

  public constructor(channel: Discord.TextBasedChannels, questions: ITestQuestion[]) {
    this.channel = channel;
    this.questions = questions;
    this.answers = Array.from({ length: questions.length }).map(() => null);
  }

  public showQuestion(index: number): void {
    if (index <= this.questions.length) {
      if (this.answers.filter((item) => item !== null).length === this.questions.length) {
        const endSelector = new MessageSelector(this.channel, 5 * 60 * 1000);
        endSelector.onConfirm(() => {
          endSelector.reset();
          this._onEnd(this.answers);
        });
        endSelector.onEnd(() => {
          endSelector.reset();
          this._onEnd(this.answers);
        });
        endSelector.runSelector(
          {
            embed: new Discord.MessageEmbed()
              .setTitle('Завершение теста')
              .setDescription(
                'У вас есть 5 минут чтобы проверить свои ответы, вам нужно завершить тест до этого моменты, иначе это произойдёт автоматически.'
              )
              .setFooter(`${MessageSelector.OK_ITEM} Завершить тест?`),
          },
          { itemsSize: 0, withOk: true }
        );
      } else {
        const questionData = this.questions[index];
        const question = ((): TestQuestion => {
          switch (questionData.type) {
            case 'single':
              return new SingleQuestion(this.channel, questionData, index, this.answers[index]?.answers || null);
            case 'multi':
              return new MultiQuestion(this.channel, questionData, index, this.answers[index]?.answers || null);
            case 'text':
              return new TextQuestion(this.channel, questionData, index, this.answers[index]?.answers || null);
          }
        })();
        question
          .start()
          .then((answer) => {
            this.answers[index] = answer;
            this.showQuestion(index + 1);
          })
          .catch(() => {
            this.answers[index] = { answers: [], correctFactor: 0 };
            const missedSelector = new MessageSelector(this.channel, 60 * 1000);
            missedSelector.onConfirm(() => {
              missedSelector.reset();
              this.showQuestion(index + 1);
            });
            missedSelector.onEnd(() => {
              missedSelector.reset();
              this._onEnd(null);
            });
            missedSelector.runSelector(
              {
                embed: new Discord.MessageEmbed()
                  .setTitle('Вы не ответили на вопрос')
                  .setDescription(
                    'Тест закроется автоматически через 60 секунд, если вы не продолжите вам будет зачитана провальная попытка!'
                  )
                  .setFooter(`${MessageSelector.OK_ITEM} Продолжить тест?`),
              },
              { itemsSize: 0, withOk: true }
            );
          });
      }
    }
  }

  public start(): Promise<ITestAnswer[]> {
    return new Promise((resolve) => {
      this._onEnd = resolve;
      this.showQuestion(0);
    });
  }
}
