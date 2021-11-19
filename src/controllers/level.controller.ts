import { getCharacterByName } from '../services/character.service';
import { ControllerBase } from '../classes/controller.base';

export class LevelController extends ControllerBase {
  public processMessage(): void {
    const charName = this.args.join(' ');
    getCharacterByName(charName).then((character) => {
      if (character) {
        this.message.reply(character.level);
      } else {
        this.message.reply(`Персонаж с именем ${charName} не найден.`);
      }
    });
  }
}
