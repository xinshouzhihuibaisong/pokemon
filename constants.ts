
import { Pokemon, PokemonType, Move, MoveCategory } from './types';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// Type Effectiveness Chart (Attacker -> Defender)
// 2 = Super Effective, 0.5 = Not Very Effective, 0 = No Effect, 1 = Normal
export const TYPE_CHART: Record<string, Record<string, number>> = {
  [PokemonType.NORMAL]: { [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0 },
  [PokemonType.FIRE]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ROCK]: 0.5 },
  [PokemonType.WATER]: { [PokemonType.FIRE]: 2, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 0.5 },
  [PokemonType.GRASS]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5 },
  [PokemonType.ELECTRIC]: { [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.ELECTRIC]: 0.5, [PokemonType.ROCK]: 0 },
  [PokemonType.PSYCHIC]: { [PokemonType.PSYCHIC]: 0.5 },
  [PokemonType.ROCK]: { [PokemonType.FIRE]: 2, [PokemonType.NORMAL]: 0.5 },
  [PokemonType.GHOST]: { [PokemonType.NORMAL]: 0, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2 },
};

export const getEffectiveness = (moveType: PokemonType, defenderTypes: PokemonType[]): number => {
  let multiplier = 1;
  const attackerChart = TYPE_CHART[moveType] || {};
  
  defenderTypes.forEach(defType => {
    if (attackerChart[defType] !== undefined) {
      multiplier *= attackerChart[defType];
    }
  });
  return multiplier;
};

// --- Moves ---

const MOVES_DB: Record<string, Partial<Move>> = {
  'tackle': { name: '撞击', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, maxPp: 35, description: '用整个身体撞向对手进行攻击。' },
  'scratch': { name: '抓', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, maxPp: 35, description: '用坚硬且尖锐的爪子抓挠对手。' },
  'ember': { name: '火花', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 25, maxPp: 25, description: '向对手发射小型的火焰进行攻击。' },
  'watergun': { name: '水枪', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 25, maxPp: 25, description: '向对手猛烈地喷射水流进行攻击。' },
  'vinewhip': { name: '藤鞭', type: PokemonType.GRASS, category: MoveCategory.PHYSICAL, power: 45, accuracy: 100, pp: 25, maxPp: 25, description: '用像鞭子一样细长的藤蔓摔打对手进行攻击。' },
  'growl': { name: '叫声', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: 0, accuracy: 100, pp: 40, maxPp: 40, effect: 'DEBUFF_DEF', description: '让对手听可爱的叫声，降低对手的防御。' },
  'flamethrower': { name: '喷射火焰', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, maxPp: 15, description: '向对手发射烈焰进行攻击。' },
  'hydropump': { name: '水炮', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 110, accuracy: 80, pp: 5, maxPp: 5, description: '向对手猛烈地喷射大量水流进行攻击。' },
  'solarbeam': { name: '日光束', type: PokemonType.GRASS, category: MoveCategory.SPECIAL, power: 120, accuracy: 100, pp: 10, maxPp: 10, description: '聚集光能进行攻击。' },
  'thunderbolt': { name: '十万伏特', type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, maxPp: 15, description: '向对手发出强力的电击进行攻击。' },
  'psychic': { name: '精神强念', type: PokemonType.PSYCHIC, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 10, maxPp: 10, description: '向对手发送强大的念力进行攻击。' },
  'recover': { name: '自我再生', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: 0, accuracy: 100, pp: 10, maxPp: 10, effect: 'HEAL', description: '让细胞再生，从而回复最大HP的一半。' },
};

export const createMove = (key: string): Move => {
  const data = MOVES_DB[key] || MOVES_DB['tackle'];
  return { id: uuid(), ...data } as Move;
};

export const REWARD_MOVES_POOL: string[] = [
  'flamethrower', 'hydropump', 'solarbeam', 'thunderbolt', 'psychic', 'recover', 'tackle', 'ember', 'watergun'
];

export const STARTER_POKEMON: Record<string, Partial<Pokemon>> = {
  FIRE: {
    name: '小火龙',
    types: [PokemonType.FIRE],
    stats: { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
    maxHp: 39,
    currentHp: 39,
    level: 5,
    exp: 0,
    maxExp: 100,
    image: 'https://img.pokemondb.net/sprites/black-white/anim/normal/charmander.gif',
    moves: [createMove('scratch'), createMove('ember'), createMove('growl')]
  },
  WATER: {
    name: '杰尼龟',
    types: [PokemonType.WATER],
    stats: { hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
    maxHp: 44,
    currentHp: 44,
    level: 5,
    exp: 0,
    maxExp: 100,
    image: 'https://img.pokemondb.net/sprites/black-white/anim/normal/squirtle.gif',
    moves: [createMove('tackle'), createMove('watergun'), createMove('growl')]
  },
  GRASS: {
    name: '妙蛙种子',
    types: [PokemonType.GRASS],
    stats: { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    maxHp: 45,
    currentHp: 45,
    level: 5,
    exp: 0,
    maxExp: 100,
    image: 'https://img.pokemondb.net/sprites/black-white/anim/normal/bulbasaur.gif',
    moves: [createMove('tackle'), createMove('vinewhip'), createMove('growl')]
  }
};
