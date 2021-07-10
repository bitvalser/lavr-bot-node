import firebase from 'firebase';

export const getBotChapterNumber = (): Promise<number> => {
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
};
