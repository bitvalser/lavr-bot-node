import firebase from 'firebase';
import { GameItem } from '../classes/game/game-item.class';
import { GamePlayer } from '../classes/game/game-player.class';
import { JsonSerialize } from '../classes/game/json-serialize.class';

export const getPlayerById = (id: string): Promise<any> => {
  return firebase
    .firestore()
    .collection('players')
    .doc(id)
    .get()
    .then((result) => result.data());
};

export const savePlayer = (player: GamePlayer): Promise<any> => {
  return firebase.firestore().collection('players').doc(player.id).set(JsonSerialize.getJsonState(player));
};

export const getShopItems = (section: string): Promise<any> => {
  return firebase
    .firestore()
    .collection(section)
    .get()
    .then((result) => result.docs.map((res) => res.data()));
};

export const getShopItemById = (section: string, id: string): Promise<any> => {
  return firebase
    .firestore()
    .collection(section)
    .doc(id)
    .get()
    .then((result) => result.data());
};

export const addItemToInventory = (userId: string, item: any): Promise<any> => {
  return firebase.firestore().collection('players').doc(userId).collection('inventory').add(item);
};

export const getUserInventory = (userId: string): Promise<any> => {
  return firebase
    .firestore()
    .collection('players')
    .doc(userId)
    .collection('inventory')
    .get()
    .then((result) => result.docs.map((doc) => doc.data()));
};
