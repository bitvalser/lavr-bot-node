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
    if (index < this.questions.length) {
      const questionData = this.questions[index];
      const question = ((): TestQuestion => {
        switch (questionData.type) {
          case 'single':
            return new SingleQuestion(this.channel, questionData, this.answers[index]?.answers || null);
          case 'multi':
            return new MultiQuestion(this.channel, questionData, this.answers[index]?.answers || null);
          case 'text':
            return new TextQuestion(this.channel, questionData, this.answers[index]?.answers || null);
        }
      })();
      question.start().then((answer) => {
        this.answers[index] = answer;
        if (this.answers.filter(Boolean).length === this.questions.length) {
          const endSelector = new MessageSelector(this.channel, 5 * 60 * 1000);
          endSelector.onConfirm(() => {
            endSelector.reset();
            this._onEnd(this.answers);
          });
          endSelector.runSelector(
            {
              embed: new Discord.MessageEmbed()
                .setTitle('Предпросмотр')
                .setDescription('Ваши варианты ответа на тест')
                .setFooter(`${MessageSelector.OK_ITEM} Завершить тест?`)
                .setFields(
                  this.questions.map((question, i) => ({
                    name: question.text,
                    value: getTestAnswer(question, this.answers[i]),
                    inline: false,
                  }))
                ),
            },
            { itemsSize: 0, withOk: true }
          );
        } else {
          this.showQuestion(index + 1);
        }
      });
    }
  }

  public start(): Promise<ITestAnswer[]> {
    return new Promise((resolve) => {
      this._onEnd = resolve;
      this.showQuestion(0);
    });
  }
}
