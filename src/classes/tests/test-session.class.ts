import * as Discord from 'discord.js';
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
  private activeQuestion: TestQuestion;
  private missedSelector: MessageSelector;
  private endSelector: MessageSelector;
  private _onEnd: (data: ITestAnswer[]) => void;
  private _onError: () => void;
  private _onUpdate: (data: ITestAnswer[]) => void;

  public constructor(channel: Discord.TextBasedChannels, questions: ITestQuestion[], answers?: ITestAnswer[]) {
    this.channel = channel;
    this.questions = questions;
    this.answers = Array.from({ length: questions.length }).map((_, i) => answers[i] || null);
  }

  public showQuestion(index: number): void {
    if (index <= this.questions.length) {
      if (this.answers.filter((item) => item !== null).length === this.questions.length) {
        this.endSelector = new MessageSelector(this.channel, 5 * 60 * 1000);
        this.endSelector.onConfirm(() => {
          this.endSelector.reset();
          this._onEnd(this.answers);
        });
        this.endSelector.onEnd(() => {
          this.endSelector.reset();
          this._onEnd(this.answers);
        });
        this.endSelector.runSelector(
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
        this.activeQuestion = ((): TestQuestion => {
          switch (questionData.type) {
            case 'single':
              return new SingleQuestion(this.channel, questionData, index, this.answers[index]?.answers || null);
            case 'multi':
              return new MultiQuestion(this.channel, questionData, index, this.answers[index]?.answers || null);
            case 'text':
              return new TextQuestion(this.channel, questionData, index, this.answers[index]?.answers || null);
          }
        })();
        this.activeQuestion
          .start()
          .then((answer) => {
            this.answers[index] = answer;
            if (this._onUpdate) {
              this._onUpdate(this.answers);
            }
            this.showQuestion(index + 1);
          })
          .catch(() => {
            this.answers[index] = { answers: [], correctFactor: 0 };
            this.missedSelector = new MessageSelector(this.channel, 60 * 1000);
            this.missedSelector.onConfirm(() => {
              this.missedSelector.reset();
              this.showQuestion(index + 1);
            });
            this.missedSelector.onEnd(() => {
              this.missedSelector.reset();
              this._onEnd(null);
            });
            this.missedSelector.runSelector(
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

  public stop(): void {
    this.activeQuestion.stop();
    if (this.missedSelector) {
      this.missedSelector.reset();
    }
    if (this.endSelector) {
      this.endSelector.reset();
    }
    this._onError();
  }

  public start({ onUpdate }: { onUpdate?: (data: ITestAnswer[]) => void } = {}): Promise<ITestAnswer[]> {
    return new Promise((resolve, reject) => {
      this._onEnd = resolve;
      this._onError = reject;
      if (onUpdate) {
        this._onUpdate = onUpdate;
      }
      this.showQuestion(this.answers.findIndex((answer) => answer === null));
    });
  }
}
