import firebase from 'firebase';
import { ITestAnswer } from '../interfaces/test-answer.interfface';

export class TestsService {
  private static instance: TestsService;

  public static getInstance(): TestsService {
    if (!TestsService.instance) {
      TestsService.instance = new TestsService();
    }
    return TestsService.instance;
  }

  public getTests(): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .where('dev', '!=', true)
      .get()
      .then((result) =>
        result.docs.map((val) => ({
          id: val.id,
          ...val.data(),
        }))
      );
  }

  public getTestById(id: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .doc(id)
      .get()
      .then((result) => result.data());
  }

  public getTestByName(name: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .where('title', '==', name)
      .where('dev', '!=', true)
      .get()
      .then((result) => {
        const val = result.docs?.[0];
        if (val) {
          return {
            id: val.id,
            ...val.data(),
          };
        }
        return null;
      });
  }

  public getTestRating(id: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .doc(id)
      .collection('results')
      .orderBy('points', 'desc')
      .get()
      .then((result) =>
        result.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
  }

  public getTestQuestions(id: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .doc(id)
      .collection('questions')
      .get()
      .then((result) =>
        result.docs.map((val) => ({
          id: val.id,
          ...val.data(),
        }))
      );
  }

  public getTestResults(id: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .doc(id)
      .collection('results')
      .get()
      .then((result) =>
        result.docs.map((val) => ({
          id: val.id,
          ...val.data(),
        }))
      );
  }

  public getTestUserResult(id: string, userId: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .doc(id)
      .collection('results')
      .doc(userId)
      .get()
      .then((result) => result.data());
  }

  public saveTestResult(
    testId: string,
    userId: string,
    userName: string,
    answers: ITestAnswer[],
    points: number
  ): Promise<any> {
    return firebase.firestore().collection('tests').doc(testId).collection('results').doc(userId).set({
      name: userName,
      answers,
      points,
      date: new Date(),
    });
  }
}
