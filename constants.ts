
import { Pokemon, PokemonType, Move, MoveCategory, Item, PokemonStats } from './types';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// --- TYPE CHART (Generation 6+) ---
export const TYPE_CHART: Record<string, Record<string, number>> = {
  [PokemonType.NORMAL]: { [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0, [PokemonType.STEEL]: 0.5 },
  [PokemonType.FIRE]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ICE]: 2, [PokemonType.BUG]: 2, [PokemonType.ROCK]: 0.5, [PokemonType.DRAGON]: 0.5, [PokemonType.STEEL]: 2 },
  [PokemonType.WATER]: { [PokemonType.FIRE]: 2, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.ROCK]: 2, [PokemonType.DRAGON]: 0.5 },
  [PokemonType.GRASS]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.POISON]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.FLYING]: 0.5, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.DRAGON]: 0.5, [PokemonType.STEEL]: 0.5 },
  [PokemonType.ELECTRIC]: { [PokemonType.WATER]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.ELECTRIC]: 0.5, [PokemonType.GROUND]: 0, [PokemonType.FLYING]: 2, [PokemonType.DRAGON]: 0.5 },
  [PokemonType.ICE]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.ICE]: 0.5, [PokemonType.GROUND]: 2, [PokemonType.FLYING]: 2, [PokemonType.DRAGON]: 2, [PokemonType.STEEL]: 0.5 },
  [PokemonType.FIGHTING]: { [PokemonType.NORMAL]: 2, [PokemonType.ICE]: 2, [PokemonType.POISON]: 0.5, [PokemonType.FLYING]: 0.5, [PokemonType.PSYCHIC]: 0.5, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.GHOST]: 0, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 2, [PokemonType.FAIRY]: 0.5 },
  [PokemonType.POISON]: { [PokemonType.GRASS]: 2, [PokemonType.POISON]: 0.5, [PokemonType.GROUND]: 0.5, [PokemonType.ROCK]: 0.5, [PokemonType.GHOST]: 0.5, [PokemonType.STEEL]: 0, [PokemonType.FAIRY]: 2 },
  [PokemonType.GROUND]: { [PokemonType.FIRE]: 2, [PokemonType.GRASS]: 0.5, [PokemonType.ELECTRIC]: 2, [PokemonType.POISON]: 2, [PokemonType.FLYING]: 0, [PokemonType.BUG]: 0.5, [PokemonType.ROCK]: 2, [PokemonType.STEEL]: 2 },
  [PokemonType.FLYING]: { [PokemonType.GRASS]: 2, [PokemonType.ELECTRIC]: 0.5, [PokemonType.FIGHTING]: 2, [PokemonType.BUG]: 2, [PokemonType.ROCK]: 0.5, [PokemonType.STEEL]: 0.5 },
  [PokemonType.PSYCHIC]: { [PokemonType.FIGHTING]: 2, [PokemonType.POISON]: 2, [PokemonType.PSYCHIC]: 0.5, [PokemonType.DARK]: 0, [PokemonType.STEEL]: 0.5 },
  [PokemonType.BUG]: { [PokemonType.FIRE]: 0.5, [PokemonType.GRASS]: 2, [PokemonType.FIGHTING]: 0.5, [PokemonType.POISON]: 0.5, [PokemonType.FLYING]: 0.5, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 0.5, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 0.5 },
  [PokemonType.ROCK]: { [PokemonType.FIRE]: 2, [PokemonType.ICE]: 2, [PokemonType.FIGHTING]: 0.5, [PokemonType.GROUND]: 0.5, [PokemonType.FLYING]: 2, [PokemonType.BUG]: 2, [PokemonType.STEEL]: 0.5 },
  [PokemonType.GHOST]: { [PokemonType.NORMAL]: 0, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2, [PokemonType.DARK]: 0.5 },
  [PokemonType.DRAGON]: { [PokemonType.DRAGON]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 0 },
  [PokemonType.STEEL]: { [PokemonType.FIRE]: 0.5, [PokemonType.WATER]: 0.5, [PokemonType.ELECTRIC]: 0.5, [PokemonType.ICE]: 2, [PokemonType.ROCK]: 2, [PokemonType.STEEL]: 0.5, [PokemonType.FAIRY]: 2 },
  [PokemonType.DARK]: { [PokemonType.FIGHTING]: 0.5, [PokemonType.PSYCHIC]: 2, [PokemonType.GHOST]: 2, [PokemonType.DARK]: 0.5, [PokemonType.FAIRY]: 0.5 },
  [PokemonType.FAIRY]: { [PokemonType.FIRE]: 0.5, [PokemonType.FIGHTING]: 2, [PokemonType.POISON]: 0.5, [PokemonType.DRAGON]: 2, [PokemonType.DARK]: 2, [PokemonType.STEEL]: 0.5 }
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

// --- MOVES DATABASE ---

const MOVES_DB: Record<string, Partial<Move>> = {
  // Normal
  'tackle': { name: '撞击', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, maxPp: 35, description: '用整个身体撞向对手。' },
  'scratch': { name: '抓', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, maxPp: 35, description: '用坚硬且尖锐的爪子抓挠。' },
  'quickattack': { name: '电光一闪', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 30, maxPp: 30, description: '以迅雷不及掩耳之势扑向对手。' },
  'hyperbeam': { name: '破坏光线', type: PokemonType.NORMAL, category: MoveCategory.SPECIAL, power: 150, accuracy: 90, pp: 5, maxPp: 5, description: '向对手发射强烈的光线。' },
  'growl': { name: '叫声', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: 0, accuracy: 100, pp: 40, maxPp: 40, effect: 'DEBUFF_DEF', description: '降低对手的防御。' },
  'recover': { name: '自我再生', type: PokemonType.NORMAL, category: MoveCategory.STATUS, power: 0, accuracy: 100, pp: 10, maxPp: 10, effect: 'HEAL', description: '回复最大HP的一半。' },
  
  // Fire
  'ember': { name: '火花', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 25, maxPp: 25, description: '发射小型的火焰。' },
  'flamethrower': { name: '喷射火焰', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, maxPp: 15, description: '发射烈焰进行攻击。' },
  'fireblast': { name: '大字爆炎', type: PokemonType.FIRE, category: MoveCategory.SPECIAL, power: 110, accuracy: 85, pp: 5, maxPp: 5, description: '用大字形状的火焰烧尽对手。' },
  
  // Water
  'watergun': { name: '水枪', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 25, maxPp: 25, description: '喷射水流进行攻击。' },
  'surf': { name: '冲浪', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, maxPp: 15, description: '用大浪攻击对手。' },
  'hydropump': { name: '水炮', type: PokemonType.WATER, category: MoveCategory.SPECIAL, power: 110, accuracy: 80, pp: 5, maxPp: 5, description: '喷射大量水流进行攻击。' },
  
  // Grass
  'vinewhip': { name: '藤鞭', type: PokemonType.GRASS, category: MoveCategory.PHYSICAL, power: 45, accuracy: 100, pp: 25, maxPp: 25, description: '用细长的藤蔓摔打对手。' },
  'razorleaf': { name: '飞叶快刀', type: PokemonType.GRASS, category: MoveCategory.PHYSICAL, power: 55, accuracy: 95, pp: 25, maxPp: 25, description: '飞出叶片切斩对手。容易击中要害。' },
  'solarbeam': { name: '日光束', type: PokemonType.GRASS, category: MoveCategory.SPECIAL, power: 120, accuracy: 100, pp: 10, maxPp: 10, description: '聚集光能进行攻击。' },
  
  // Electric
  'thundershock': { name: '电击', type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 40, accuracy: 100, pp: 30, maxPp: 30, description: '发出电流刺激对手。' },
  'thunderbolt': { name: '十万伏特', type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 15, maxPp: 15, description: '发出强力的电击。' },
  'thunder': { name: '打雷', type: PokemonType.ELECTRIC, category: MoveCategory.SPECIAL, power: 110, accuracy: 70, pp: 10, maxPp: 10, description: '向对手劈下暴雷。' },
  
  // Psychic
  'confusion': { name: '念力', type: PokemonType.PSYCHIC, category: MoveCategory.SPECIAL, power: 50, accuracy: 100, pp: 25, maxPp: 25, description: '用微弱的念力进行攻击。' },
  'psychic': { name: '精神强念', type: PokemonType.PSYCHIC, category: MoveCategory.SPECIAL, power: 90, accuracy: 100, pp: 10, maxPp: 10, description: '发送强大的念力进行攻击。' },
  
  // Rock/Ground/Flying/Ghost
  'rockthrow': { name: '落石', type: PokemonType.ROCK, category: MoveCategory.PHYSICAL, power: 50, accuracy: 90, pp: 15, maxPp: 15, description: '拿起小岩石投掷对手。' },
  'earthquake': { name: '地震', type: PokemonType.GROUND, category: MoveCategory.PHYSICAL, power: 100, accuracy: 100, pp: 10, maxPp: 10, description: '引发地震，攻击周围所有宝可梦。' },
  'wingattack': { name: '翅膀攻击', type: PokemonType.FLYING, category: MoveCategory.PHYSICAL, power: 60, accuracy: 100, pp: 35, maxPp: 35, description: '大大展开翅膀撞击对手。' },
  'shadowball': { name: '暗影球', type: PokemonType.GHOST, category: MoveCategory.SPECIAL, power: 80, accuracy: 100, pp: 15, maxPp: 15, description: '投掷黑影之块进行攻击。' },
  
  // Dragon
  'dragonclaw': { name: '龙爪', type: PokemonType.DRAGON, category: MoveCategory.PHYSICAL, power: 80, accuracy: 100, pp: 15, maxPp: 15, description: '用尖锐的巨爪劈开对手。' },
};

export const createMove = (key: string): Move => {
  const data = MOVES_DB[key] || MOVES_DB['tackle'];
  return { id: uuid(), ...data } as Move;
};

// --- ITEMS DATABASE ---

export const ITEMS_DB: Record<string, Omit<Item, 'count' | 'id'>> = {
  'potion': { name: '伤药', description: '回复20点HP', effectType: 'HEAL_HP', value: 20, icon: '💊' },
  'superpotion': { name: '好伤药', description: '回复50点HP', effectType: 'HEAL_HP', value: 50, icon: '🧪' },
  'hyperpotion': { name: '厉害伤药', description: '回复200点HP', effectType: 'HEAL_HP', value: 200, icon: '🏺' },
  'ether': { name: 'PP单项小补剂', description: '回复一个招式10点PP(战斗中自动选第一个)', effectType: 'HEAL_PP', value: 10, icon: '🍇' },
  'xattack': { name: '力量强化', description: '本次战斗中攻击力提升', effectType: 'BUFF_ATK', value: 1.5, icon: '⚔️' },
  'xdefense': { name: '防御强化', description: '本次战斗中防御力提升', effectType: 'BUFF_DEF', value: 1.5, icon: '🛡️' },
};

export const createItem = (key: string, count: number = 1): Item => {
    const template = ITEMS_DB[key] || ITEMS_DB['potion'];
    return {
        id: uuid(),
        ...template,
        count
    };
};

export const REWARD_MOVES_POOL: string[] = Object.keys(MOVES_DB);
export const REWARD_ITEMS_POOL: string[] = Object.keys(ITEMS_DB);

// --- STARTER POKEMON ---

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
    types: [PokemonType.GRASS, PokemonType.POISON],
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

// --- FALLBACK ENEMY POOLS (By Tier) ---

interface EnemyTemplate {
    name: string;
    englishName: string;
    types: PokemonType[];
    stats: PokemonStats;
    moves: string[];
}

const TIER_1_ENEMIES: EnemyTemplate[] = [
    { name: '小拉达', englishName: 'rattata', types: [PokemonType.NORMAL], stats: { hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 }, moves: ['tackle', 'quickattack'] },
    { name: '波波', englishName: 'pidgey', types: [PokemonType.NORMAL, PokemonType.FLYING], stats: { hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 }, moves: ['tackle', 'wingattack'] },
    { name: '绿毛虫', englishName: 'caterpie', types: [PokemonType.BUG], stats: { hp: 45, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45 }, moves: ['tackle', 'stringshot'] },
    { name: '皮卡丘', englishName: 'pikachu', types: [PokemonType.ELECTRIC], stats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 }, moves: ['thundershock', 'quickattack'] },
    { name: '小拳石', englishName: 'geodude', types: [PokemonType.ROCK, PokemonType.GROUND], stats: { hp: 40, attack: 80, defense: 100, spAttack: 30, spDefense: 30, speed: 20 }, moves: ['tackle', 'rockthrow'] },
];

const TIER_2_ENEMIES: EnemyTemplate[] = [
    { name: '比比鸟', englishName: 'pidgeotto', types: [PokemonType.NORMAL, PokemonType.FLYING], stats: { hp: 63, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71 }, moves: ['wingattack', 'quickattack', 'growl'] },
    { name: '大岩蛇', englishName: 'onix', types: [PokemonType.ROCK, PokemonType.GROUND], stats: { hp: 35, attack: 45, defense: 160, spAttack: 30, spDefense: 45, speed: 70 }, moves: ['rockthrow', 'tackle', 'screech'] },
    { name: '鬼斯', englishName: 'gastly', types: [PokemonType.GHOST, PokemonType.POISON], stats: { hp: 30, attack: 35, defense: 30, spAttack: 100, spDefense: 35, speed: 80 }, moves: ['lick', 'confusion'] },
    { name: '卡咪龟', englishName: 'wartortle', types: [PokemonType.WATER], stats: { hp: 59, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58 }, moves: ['watergun', 'bite', 'withdraw'] },
    { name: '火恐龙', englishName: 'charmeleon', types: [PokemonType.FIRE], stats: { hp: 58, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80 }, moves: ['ember', 'scratch', 'growl'] },
];

const TIER_3_ENEMIES: EnemyTemplate[] = [
    { name: '喷火龙', englishName: 'charizard', types: [PokemonType.FIRE, PokemonType.FLYING], stats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 }, moves: ['flamethrower', 'wingattack', 'dragonclaw'] },
    { name: '水箭龟', englishName: 'blastoise', types: [PokemonType.WATER], stats: { hp: 79, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78 }, moves: ['hydropump', 'bite', 'withdraw'] },
    { name: '妙蛙花', englishName: 'venusaur', types: [PokemonType.GRASS, PokemonType.POISON], stats: { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 }, moves: ['solarbeam', 'sludgebomb', 'growl'] },
    { name: '耿鬼', englishName: 'gengar', types: [PokemonType.GHOST, PokemonType.POISON], stats: { hp: 60, attack: 65, defense: 60, spAttack: 130, spDefense: 75, speed: 110 }, moves: ['shadowball', 'psychic', 'confuseray'] },
    { name: '快龙', englishName: 'dragonite', types: [PokemonType.DRAGON, PokemonType.FLYING], stats: { hp: 91, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80 }, moves: ['dragonclaw', 'wingattack', 'thunderwave'] },
];

const BOSS_ENEMIES: EnemyTemplate[] = [
    { name: '超梦', englishName: 'mewtwo', types: [PokemonType.PSYCHIC], stats: { hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130 }, moves: ['psychic', 'shadowball', 'recover', 'swift'] },
    { name: '烈空坐', englishName: 'rayquaza', types: [PokemonType.DRAGON, PokemonType.FLYING], stats: { hp: 105, attack: 150, defense: 90, spAttack: 150, spDefense: 90, speed: 95 }, moves: ['dragonclaw', 'hyperbeam', 'crunch', 'fly'] },
];

export const GET_TIER_POOL = (floor: number, isBoss: boolean, isElite: boolean): EnemyTemplate[] => {
    if (isBoss) return BOSS_ENEMIES;
    if (floor >= 7 || isElite) return TIER_3_ENEMIES;
    if (floor >= 3) return TIER_2_ENEMIES;
    return TIER_1_ENEMIES;
}
