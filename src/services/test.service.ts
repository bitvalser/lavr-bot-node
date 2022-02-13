import firebase from 'firebase';
import { IS_PROD } from '..';
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
    let testsRef: any = firebase.firestore().collection('tests');
    if (IS_PROD) {
      testsRef = testsRef.where('dev', '!=', true);
    }
    return testsRef.get().then((result) =>
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
    let testRef: any = firebase.firestore().collection('tests').where('title', '==', name);
    if (IS_PROD) {
      testRef = testRef.where('dev', '!=', true);
    }
    return testRef.get().then((result) => {
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
        result.docs
          .map((doc): any => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => (b.points === a.points ? +a.date - +b.date : 0))
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
    return firebase
      .firestore()
      .collection('tests')
      .doc(testId)
      .collection('results')
      .doc(userId)
      .set(
        {
          name: userName,
          answers,
          points,
          date: new Date(),
          attempts: firebase.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
  }

  public updateTestResultAttempt(testId: string, userId: string): Promise<any> {
    return firebase
      .firestore()
      .collection('tests')
      .doc(testId)
      .collection('results')
      .doc(userId)
      .update({
        attempts: firebase.firestore.FieldValue.increment(1),
      });
  }
}
