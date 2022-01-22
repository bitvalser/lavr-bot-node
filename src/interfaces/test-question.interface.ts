export interface ITestQuestion {
  answers?: string[];
  type: 'single' | 'multi' | 'text';
  image: string;
  rightAnswers: string[];
  text: string;
}
