import { CharacterService } from '../services/character.service';
import { ControllerBase } from '../classes/controller-base.class';
import { Controller } from '../decorators/controller.decorator';
import { Channels } from '../constants/channels.constants';

@Controller({
  commands: ['уровень'],
  channelWhitelist: [Channels.Bot],
})
export class LevelController extends ControllerBase {
  private charactersService: CharacterService = CharacterService.getInstance();

  public processCommand(): void {
    const charName = this.args.join(' ');
    this.charactersService.getCharacterByName(charName).then((character) => {
      if (character) {
        this.message.reply(character.level);
      } else {
        this.message.reply(`Персонаж с именем ${charName} не найден.`);
      }
    });
  }
}
