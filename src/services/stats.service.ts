import firebase from 'firebase';

export class StatsService {
  private static instance: StatsService;

  public static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  public getStats(): Promise<any> {
    return firebase
      .firestore()
      .collection('stats')
      .get()
      .then((result) =>
        result.docs.reduce(
          (acc, val) => ({
            ...acc,
            [val.id]: val.data(),
          }),
          {}
        )
      );
  }

  public getStatByName(name: string): Promise<any> {
    return firebase
      .firestore()
      .collection('stats')
      .doc(name)
      .get()
      .then((result) => result.data());
  }
}
