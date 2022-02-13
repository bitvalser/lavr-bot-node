import * as Discord from 'discord.js';
import { TestQuestion } from './test-question.class';

export class TextQuestion extends TestQuestion {
  private selectedAnswer: string = this.userAnswers && this.userAnswers.length > 0 ? this.userAnswers[0] : null;
  private collector: Discord.MessageCollector;

  private getContent(): { embeds?: Discord.MessageEmbed[]; content?: string } {
    const message = new Discord.MessageEmbed()
      .setTitle(`${this.index + 1} - Текстовый вопрос`)
      .setDescription(this.text.replace(/;\s/g, '\n'))
      .setFooter('Для ответа на вопрос введите сообщение в чат');
    if (this.image) {
      message.setImage(this.image);
    }
    if (this.selectedAnswer) {
      message.setAuthor(`Ваш ответ - ${this.selectedAnswer.substring(0, 40)}`);
    }
    return {
      embeds: [message],
    };
  }

  protected calculateCorrectFactory(answers: string[]): number {
    return answers.some((answer) => this.rightAnswers.includes(answer.toLowerCase())) ? 1 : 0;
  }

  public stop(): void {
    this.collector.removeAllListeners();
    this.collector.stop();
  }

  protected processQuestion(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.channel.send(this.getContent()).then((questionMessage) => {
        this.collector = this.channel.createMessageCollector({
          max: 1,
          time: 3 * 60 * 1000,
          filter: (message) => !message.author.bot && !message.content.startsWith('!'),
        });
        this.collector.on('end', (collected) => {
          if (collected.size > 0) {
            const message = collected.first();
            this.selectedAnswer = message.content.trim();
            questionMessage.edit(this.getContent());
            resolve([this.selectedAnswer]);
          } else {
            reject();
          }
        });
      });
    });
  }
}
