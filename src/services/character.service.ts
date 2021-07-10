import firebase from 'firebase';

export const getCharacters = (): Promise<any> => {
  return firebase
    .firestore()
    .collection('characters')
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

export const getCharacterByName = (name: string): Promise<any> => {
  return firebase
    .firestore()
    .collection('characters')
    .doc(name)
    .get()
    .then((result) => result.data());
};
