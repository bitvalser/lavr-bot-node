import firebase from 'firebase';

export const getGifs = (): Promise<any> => {
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
};

export const getGifByName = (name: string): Promise<any> => {
  return firebase
    .firestore()
    .collection('gifs')
    .doc(name)
    .get()
    .then((result) => ({ id: result.id, ...result.data() }));
};

export const createGif = (name: string, url: string): Promise<any> => {
  return firebase.firestore().collection('gifs').doc(name).set({ url });
};
