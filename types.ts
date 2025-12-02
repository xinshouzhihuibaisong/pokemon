
export enum PokemonType {
  NORMAL = 'Normal',
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  ICE = 'Ice',
  FIGHTING = 'Fighting',
  POISON = 'Poison',
  GROUND = 'Ground',
  FLYING = 'Flying',
  PSYCHIC = 'Psychic',
  BUG = 'Bug',
  ROCK = 'Rock',
  GHOST = 'Ghost',
  DRAGON = 'Dragon',
  STEEL = 'Steel',
  DARK = 'Dark',
  FAIRY = 'Fairy'
}

export enum MoveCategory {
  PHYSICAL = 'Physical',
  SPECIAL = 'Special',
  STATUS = 'Status'
}

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number;
  accuracy: number;
  pp: number;
  maxPp: number;
  description: string;
  priority?: number;
  effect?: 'HEAL' | 'BUFF_ATK' | 'BUFF_DEF' | 'DEBUFF_DEF' | 'NONE';
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Pokemon {
  id: string;
  name: string;
  level: number;
  types: PokemonType[];
  stats: PokemonStats;
  currentHp: number;
  maxHp: number;
  moves: Move[];
  exp: number;
  maxExp: number;
  image: string; // URL
  isPlayer: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  effectType: 'HEAL_HP' | 'HEAL_PP' | 'BUFF_ATK' | 'BUFF_DEF' | 'REVIVE';
  value: number; // HP amount or Stat multiplier
  count: number;
  icon: string;
}

export enum NodeType {
  START = 'START',
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  EVENT = 'EVENT',
  REST = 'REST',
  BOSS = 'BOSS'
}

export interface MapNode {
  id: string;
  type: NodeType;
  x: number; // For visual layout (row)
  y: number; // For visual layout (column/lane)
  children: string[]; // IDs of connected next nodes
  completed: boolean;
  locked: boolean;
}

export enum GameStatus {
  MENU = 'MENU',
  MAP = 'MAP',
  COMBAT = 'COMBAT',
  EVENT = 'EVENT',
  REST = 'REST',
  REWARD = 'REWARD',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  LEVEL_UP = 'LEVEL_UP'
}

export interface GameState {
  status: GameStatus;
  player: Pokemon;
  bag: Item[];
  currentEnemy: Pokemon | null;
  floor: number;
  map: MapNode[];
  currentNodeId: string | null;
  loading: boolean;
  loadingMessage: string;
  battleLog: string[];
  eventData?: {
      title: string;
      description: string;
      choices: { text: string; action: () => void }[];
  } | null;
}
