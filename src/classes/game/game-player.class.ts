import * as Discord from 'discord.js';

const LEVELS = [
  'Область основ',
  'Продвинутая область',
  'Высшая область',
  'Область дворянина',
  'Область лорда',
  'Королевская область',
  'Императорская область',
  'Область монарха',
  'Область повелителя',
  'Область властелина',
];

const ELEMENTS_MAP = ['Чистая сила', 'Ветер', 'Вода', 'Земля', 'Жар', 'Холод', 'Эфир', 'Тьма', 'Свет'];

export type GameSkill = 'power' | 'dexterity' | 'reaction' | 'anger' | 'intelligence' | 'luck';
export type GameLevelUp = {
  [skill in GameSkill]?: number;
};
export const SKILLS: GameSkill[] = ['power', 'dexterity', 'reaction', 'anger', 'intelligence', 'luck'];
export type GameElement = 'strength' | 'wind' | 'water' | 'terra' | 'heat' | 'cold' | 'ether' | 'dark' | 'light';
export const ELEMENTS: GameElement[] = ['strength', 'wind', 'water', 'terra', 'heat', 'cold', 'ether', 'dark', 'light'];
const SKILL_MAP: {
  [skill in GameSkill]: string;
} = {
  power: 'Сила',
  dexterity: 'Ловкость',
  reaction: 'Реакция',
  anger: 'Злость',
  intelligence: 'Удача',
  luck: 'Интеллект',
};
export const COUNT_REACTION = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];
export const CONFIRM_EMOJI = '✔️';
export const DECLINE_EMOJI = '❌';

const RANGE_SCALE = 20;

export class GamePlayer {
  public id: string;
  public power: number;
  public dexterity: number;
  public reaction: number;
  public anger: number;
  public intelligence: number;
  public luck: number;
  public level: [number, number];
  public money: number;
  public health: [number, number];
  public energy: [number, number];
  public points: number;
  public elements: number[];

  constructor(
    id: string,
    power: number,
    dexterity: number,
    reaction: number,
    anger: number,
    intelligence: number,
    luck: number,
    level: [number, number],
    money: number,
    points: number,
    elements: number[],
    health: [number, number],
    energy: [number, number]
  ) {
    this.power = power;
    this.dexterity = dexterity;
    this.reaction = reaction;
    this.anger = anger;
    this.intelligence = intelligence;
    this.luck = luck;
    this.level = level;
    this.id = id;
    this.money = money;
    this.points = points;
    this.elements = elements;
    this.health = health;
    this.energy = energy;
  }

  public levelUp(skills: GameLevelUp): void {
    const usedPoints = Object.values(skills).reduce((acc, val) => acc + val, 0);
    if (usedPoints >= this.points && this.level[1] !== 9) {
      this.points -= usedPoints;
      Object.keys(skills).forEach((key) => {
        this[key as GameSkill] += skills[key as GameSkill];
      });
      this.level[1] += 1;
    }
  }

  public canLevelUp(skills: GameLevelUp): string {
    const usedPoints = Object.values(skills).reduce((acc, val) => acc + val, 0);
    const problems = [
      () => (usedPoints <= this.points ? null : 'Недостаточно очков умений'),
      () => (usedPoints !== 0 ? null : 'Выберете хотя бы одно умение'),
      () => (this.level[1] < 9 ? null : 'Вы находитесь на пике, для повышения уровня нужен прорывы'),
    ]
      .map((predicate) => predicate())
      .filter((res) => !!res);
    return problems.length > 0 ? problems[0] : null;
  }

  public static createNew(id: string): GamePlayer {
    return new GamePlayer(
      id,
      10,
      10,
      10,
      10,
      10,
      10,
      [0, 0],
      0,
      0,
      [40, 40, 40, 40, 40, 40, 40, 40, 40],
      [100, 100],
      [50, 50]
    );
  }

  public getStringLevel(): string {
    return `${LEVELS[this.level[0]]} ${this.level[1] + 1} ступень`;
  }

  public getRichLevelUp(skills: GameLevelUp = {}): Discord.MessageEmbed {
    const usedPoints = Object.values(skills).reduce((acc, val) => acc + val, 0);
    const points = this.points - usedPoints;
    const canLevelUp = this.canLevelUp(skills);

    return new Discord.MessageEmbed({
      title: 'Повышение уровня',
      fields: [
        ...SKILLS.map((skill, i) => ({
          name: `${COUNT_REACTION[i]} ${SKILL_MAP[skill]}`,
          value: `${this[skill]}${skills[skill] ? ` (+${skills[skill]})` : ''}`,
          inline: true,
        })),
        {
          name: 'Очки умений',
          value: (points < 0 ? 0 : points).toString(),
        },
      ],
      footer: {
        text: !canLevelUp ? `${CONFIRM_EMOJI} Вы можете повысить уровень` : `${DECLINE_EMOJI} ${canLevelUp}`,
      },
    });
  }

  public getRichStatus(): Discord.MessageEmbed {
    const health = this.health[0] > 0 ? Math.ceil((this.health[0] / this.health[1]) * RANGE_SCALE) : 0;
    const energy = this.energy[0] > 0 ? Math.ceil((this.energy[0] / this.energy[1]) * RANGE_SCALE) : 0;

    return new Discord.MessageEmbed({
      title: 'Статус',
      description: this.getStringLevel(),
      fields: [
        {
          name: 'Здоровье',
          value: `${this.health[0]}/${this.health[1]}\n${'🟩'.repeat(health)}${'⬜'.repeat(RANGE_SCALE - health)}`,
        },
        {
          name: 'Энергия',
          value: `${this.energy[0]}/${this.energy[1]}\n${'🟦'.repeat(energy)}${'⬜'.repeat(RANGE_SCALE - energy)}`,
        },
        ...SKILLS.map((skill) => ({
          name: SKILL_MAP[skill],
          value: this[skill].toString(),
          inline: true,
        })),
        {
          name: 'Стихии',
          value: this.elements.map((value, i) => `*${ELEMENTS_MAP[i]}* - ${value}%`).join('\n'),
        },
        {
          name: 'Поток',
          value: this.elements.reduce((acc, val) => acc + val, 0).toString(),
        },
        {
          name: 'Очки умений',
          value: this.points.toString(),
        },
        {
          name: 'Сферы',
          value: this.money.toString(),
        },
      ],
      color: '#0099ff',
    });
  }
}
