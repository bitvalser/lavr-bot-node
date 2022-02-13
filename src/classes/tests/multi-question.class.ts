import * as Discord from 'discord.js';
import { TestQuestion } from './test-question.class';
import { MessageSelector } from '../message-selector.class';

export class MultiQuestion extends TestQuestion {
  private selectedAnswers: number[] =
    this.userAnswers && this.userAnswers.length > 0 ? this.userAnswers.map((item) => +item) : [];
  private selector: MessageSelector;

  private getContent(): { embed?: Discord.MessageEmbed; content?: string } {
    const message = new Discord.MessageEmbed()
      .setTitle(`${this.index + 1} - Вопрос с несколькими вариантами ответа`)
      .setDescription(this.text.replace(/;\s/g, '\n'))
      .setFields(
        this.answers.map((text, i) => ({
          inline: true,
          name: `${MessageSelector.SELECT_ITEMS[i]} - Вариант`,
          value: this.selectedAnswers.includes(i) ? `**(${text})**` : text,
        }))
      )
      .setFooter(`Для подтврждения ответа нажмите - ${MessageSelector.OK_ITEM}`);
    if (this.image) {
      message.setImage(this.image);
    }
    return {
      embed: message,
    };
  }

  protected calculateCorrectFactory(answers: string[]): number {
    const rightAnswersCount = answers.filter((answer) => this.rightAnswers.includes(answer)).length;
    const errorCheck = answers.length - rightAnswersCount;
    const totalPoints = rightAnswersCount - errorCheck;
    return totalPoints >= 0 ? totalPoints / this.rightAnswers.length : 0;
  }

  public stop(): void {
    this.selector.reset();
  }

  protected processQuestion(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.selector = new MessageSelector(this.channel);
      this.selector.onSelect((answer) => {
        if (this.selectedAnswers.includes(answer)) {
          this.selectedAnswers = this.selectedAnswers.filter((el) => el !== answer);
        } else {
          this.selectedAnswers.push(answer);
        }
        this.selector.updateMessage(this.getContent());
      });
      this.selector.onConfirm(() => {
        if (this.selectedAnswers.length > 0) {
          this.selector.reset();
          resolve(this.selectedAnswers.map((item) => item.toString()));
        }
      });
      this.selector.onEnd(() => {
        this.selector.reset();
        reject();
      });
      this.selector.runSelector(this.getContent(), {
        itemsSize: this.answers.length,
        withOk: true,
      });
    });
  }
}
