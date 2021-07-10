import firebase from 'firebase';

export const getStats = (): Promise<any> => {
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
};

export const getStatByName = (name: string): Promise<any> => {
  return firebase
    .firestore()
    .collection('stats')
    .doc(name)
    .get()
    .then((result) => result.data());
};
