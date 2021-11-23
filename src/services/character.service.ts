import firebase from 'firebase';

export class CharacterService {
  private static instance: CharacterService;

  public static getInstance(): CharacterService {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService();
    }
    return CharacterService.instance;
  }

  public getCharacters(): Promise<any> {
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
  }

  public getCharacterByName(name: string): Promise<any> {
    return firebase
      .firestore()
      .collection('characters')
      .doc(name)
      .get()
      .then((result) => result.data());
  }
}
