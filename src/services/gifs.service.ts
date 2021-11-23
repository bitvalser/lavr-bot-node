import firebase from 'firebase';

export class GifsService {
  private static instance: GifsService;

  public static getInstance(): GifsService {
    if (!GifsService.instance) {
      GifsService.instance = new GifsService();
    }
    return GifsService.instance;
  }

  public getGifs(): Promise<any> {
    return firebase
      .firestore()
      .collection('gifs')
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

  public getGifByName(name: string): Promise<any> {
    return firebase
      .firestore()
      .collection('gifs')
      .doc(name)
      .get()
      .then((result) => ({ id: result.id, ...result.data() }));
  }

  public createGif(name: string, url: string): Promise<any> {
    return firebase.firestore().collection('gifs').doc(name).set({ url });
  }
}
