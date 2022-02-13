import * as Discord from 'discord.js';
import { TestQuestion } from './test-question.class';
import { MessageSelector } from '../message-selector.class';

export class SingleQuestion extends TestQuestion {
  private selectedAnswer: number = this.userAnswers && this.userAnswers.length > 0 ? +this.userAnswers[0] : null;
  private selector: MessageSelector;

  private getContent(): { embed?: Discord.MessageEmbed; content?: string } {
    const message = new Discord.MessageEmbed()
      .setTitle(`${this.index + 1} - Вопрос с одним вариантом ответа`)
      .setDescription(this.text.replace(/;\s/g, '\n'))
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

  public stop(): void {
    this.selector.reset();
  }

  protected processQuestion(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.selector = new MessageSelector(this.channel);
      this.selector.onSelect((answer) => {
        this.selectedAnswer = answer;
        this.selector.updateMessage(this.getContent());
      });
      this.selector.onConfirm(() => {
        if (this.selectedAnswer !== null) {
          this.selector.reset();
          resolve([this.selectedAnswer.toString()]);
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
