import * as Discord from 'discord.js';
import { TestQuestion } from './test-question.class';
import { MessageSelector } from '../message-selector.class';

export class SingleQuestion extends TestQuestion {
  private selectedAnswer: number = this.userAnswers && this.userAnswers.length > 0 ? +this.userAnswers[0] : null;

  private getContent(): { embed?: Discord.MessageEmbed; content?: string } {
    const message = new Discord.MessageEmbed()
      .setTitle('Вопрос с одним вариантом ответа')
      .setDescription(this.text)
      .setFields(
        this.answers.map((text, i) => ({
          inline: true,
          name: `${MessageSelector.SELECT_ITEMS[i]} - Вариант`,
          value: i === this.selectedAnswer ? `**(${text})**` : text,
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
        this.selectedAnswer = answer;
        selector.updateMessage(this.getContent());
      });
      selector.onConfirm(() => {
        if (this.selectedAnswer !== null) {
          selector.reset();
          resolve([this.selectedAnswer.toString()]);
        }
      });
      selector.runSelector(this.getContent(), {
        itemsSize: this.answers.length,
        withOk: true,
      });
    });
  }
}
