import firebase from 'firebase';

export class AdditionalService {
  private static instance: AdditionalService;

  public static getInstance(): AdditionalService {
    if (!AdditionalService.instance) {
      AdditionalService.instance = new AdditionalService();
    }
    return AdditionalService.instance;
  }

  public getBotChapterNumber(): Promise<number> {
    return firebase
      .firestore()
      .collection('additionalData')
      .doc('botChapters')
      .get()
      .then((result) => {
        const count = result.data()?.count;
        firebase
          .firestore()
          .collection('additionalData')
          .doc('botChapters')
          .update({ count: count + 1 });
        return count;
      });
  }
}
