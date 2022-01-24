import { ITestAnswer } from '../interfaces/test-answer.interfface';
import { ITestQuestion } from '../interfaces/test-question.interface';

export const getTestAnswer = (question: ITestQuestion, answer: ITestAnswer) => {
  switch (question.type) {
    case 'text':
      return answer?.answers.length > 0 ? answer.answers[0] : '*(Нет ответа)*';
    default:
      return answer?.answers.length > 0
        ? answer?.answers?.map((index) => question.answers[index]).join('; ') || ''
        : '*(Нет ответа)*';
  }
};
