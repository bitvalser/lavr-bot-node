import { ITestAnswer } from '../interfaces/test-answer.interfface';
import { ITestQuestion } from '../interfaces/test-question.interface';

export const getTestAnswer = (question: ITestQuestion, answer: ITestAnswer) => {
  switch (question.type) {
    case 'text':
      return answer.answers[0];
    default:
      return answer?.answers?.map((index) => question.answers[index]).join('; ') || '';
  }
};
