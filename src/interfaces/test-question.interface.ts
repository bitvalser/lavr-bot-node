export interface ITestQuestion {
  answers?: string[];
  type: 'single' | 'multi' | 'text';
  image: string;
  comment?: string;
  rightAnswers: string[];
  text: string;
}
