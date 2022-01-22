import * as Discord from 'discord.js';
import { TestQuestion } from './test-question.class';
import { MessageSelector } from '../message-selector.class';

export class MultiQuestion extends TestQuestion {
  private selectedAnswers: number[] =
    this.userAnswers && this.userAnswers.length > 0 ? this.userAnswers.map((item) => +item) : [];

  private getContent(): { embed?: Discord.MessageEmbed; content?: string } {
    const message = new Discord.MessageEmbed()
      .setTitle('Вопрос с несколькими вариантами ответа')
      .setDescription(this.text)
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

  protected processQuestion(): Promise<string[]> {
    return new Promise((resolve) => {
      const selector = new MessageSelector(this.channel);
      selector.onSelect((answer) => {
        if (this.selectedAnswers.includes(answer)) {
          this.selectedAnswers = this.selectedAnswers.filter((el) => el !== answer);
        } else {
          this.selectedAnswers.push(answer);
        }
        selector.updateMessage(this.getContent());
      });
      selector.onConfirm(() => {
        if (this.selectedAnswers.length > 0) {
          selector.reset();
          resolve(this.selectedAnswers.map((item) => item.toString()));
        }
      });
      selector.runSelector(this.getContent(), {
        itemsSize: this.answers.length,
        withOk: true,
      });
    });
  }
}
