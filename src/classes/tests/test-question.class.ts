import * as Discord from 'discord.js';
import { ITestAnswer } from '../../interfaces/test-answer.interfface';

export abstract class TestQuestion {
  protected channel: Discord.TextBasedChannels;
  protected text: string;
  protected index: number;
  protected image: string;
  protected answers: string[];
  protected rightAnswers: string[];
  protected userAnswers: string[];

  public constructor(
    channel: Discord.TextBasedChannels,
    data: { text: string; answers?: string[]; rightAnswers: string[]; image?: string },
    index: number,
    userAnswers: string[] = null
  ) {
    this.channel = channel;
    this.text = data.text;
    this.image = data.image;
    this.answers = data.answers || [];
    this.rightAnswers = data.rightAnswers;
    this.userAnswers = userAnswers;
    this.index = index;
  }

  protected abstract processQuestion(): Promise<string[]>;

  protected calculateCorrectFactory(answers: string[]): number {
    return this.rightAnswers.filter((rightAnswer, i) => +rightAnswer === +answers[i]).length / this.rightAnswers.length;
  }

  public start(): Promise<ITestAnswer> {
    return this.processQuestion().then((answers) => ({
      answers,
      correctFactor: this.calculateCorrectFactory(answers),
    }));
  }
}
