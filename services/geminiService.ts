
import { GoogleGenAI, Type } from "@google/genai";
import { Pokemon, PokemonType, NodeType, MoveCategory, Move } from '../types';
import { GET_TIER_POOL, createMove } from '../constants';

const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
  } catch (e) {
    console.warn("Could not access process.env");
    return '';
  }
};

let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiInstance;
};

const MODEL_NAME = 'gemini-2.5-flash';
const uuid = () => Math.random().toString(36).substring(2, 9);

export const generateEnemy = async (floor: number, type: NodeType): Promise<Pokemon> => {
  // Use fallback immediately if no API key is potentially available (save time)
  // But strictly speaking we should try. For now, let's try if key exists.
  if (!getApiKey()) {
    console.log("No API Key found, using local enemy pool.");
    return generateFallbackEnemy(floor, type);
  }

  const isBoss = type === NodeType.BOSS;
  const isElite = type === NodeType.ELITE;
  const level = 5 + floor * 2 + (isBoss ? 5 : 0);
  const hpScale = isBoss ? 200 : isElite ? 100 : 40 + (floor * 5);

  const systemInstruction = `
    You are a Pokemon Game Designer.
    Generate a JSON object for a single wild Pokemon enemy.
    Level: ${level}.
    Floor: ${floor}.
    Context: A Roguelike tower climber.
    
    The Pokemon must have:
    - name (Chinese)
    - englishName (for sprites)
    - types (Array of strings from: Fire, Water, Grass, Normal, Electric, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Steel, Dark, Fairy)
    - stats: { hp, attack, defense, spAttack, spDefense, speed } (Base stats scaled to level ${level})
    - maxHp (Should be around ${hpScale})
    - moves: Array of 3-4 moves. Each move needs: name, type, category (Physical/Special/Status), power, accuracy, pp, maxPp.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a ${isBoss ? 'Legendary Boss' : 'Wild'} Pokemon for floor ${floor}.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            englishName: { type: Type.STRING },
            types: { type: Type.ARRAY, items: { type: Type.STRING } },
            stats: {
              type: Type.OBJECT,
              properties: {
                hp: { type: Type.INTEGER },
                attack: { type: Type.INTEGER },
                defense: { type: Type.INTEGER },
                spAttack: { type: Type.INTEGER },
                spDefense: { type: Type.INTEGER },
                speed: { type: Type.INTEGER }
              }
            },
            maxHp: { type: Type.INTEGER },
            moves: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Physical", "Special", "Status"] },
                  power: { type: Type.INTEGER },
                  accuracy: { type: Type.INTEGER },
                  pp: { type: Type.INTEGER },
                  maxPp: { type: Type.INTEGER },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["name", "englishName", "types", "stats", "maxHp", "moves"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const englishName = data.englishName?.toLowerCase() || 'ditto';
    
    return {
      id: `enemy-${Date.now()}`,
      name: data.name || "Unknown",
      level: level,
      types: data.types as PokemonType[],
      stats: data.stats,
      currentHp: data.maxHp,
      maxHp: data.maxHp,
      moves: data.moves.map((m: any) => ({ ...m, id: uuid() })) as Move[],
      exp: 0,
      maxExp: 0,
      image: `https://img.pokemondb.net/sprites/black-white/anim/normal/${englishName}.gif`,
      isPlayer: false
    };
  } catch (error) {
    console.error("Gemini generation failed:", error);
    return generateFallbackEnemy(floor, type);
  }
};

const generateFallbackEnemy = (floor: number, type: NodeType): Pokemon => {
  const isBoss = type === NodeType.BOSS;
  const isElite = type === NodeType.ELITE;
  const level = 5 + floor * (isBoss ? 3 : 2);
  
  const pool = GET_TIER_POOL(floor, isBoss, isElite);
  const template = pool[Math.floor(Math.random() * pool.length)];
  
  // Scale stats based on level difference from base? 
  // For simplicity, we just take base stats + level bonuses
  const hpMultiplier = isBoss ? 5 : isElite ? 3 : 2;
  const statMultiplier = 1 + (level / 50);

  const maxHp = Math.floor(template.stats.hp * hpMultiplier + (level * 2));
  
  return {
    id: `enemy-${Date.now()}`,
    name: template.name,
    level: level,
    types: template.types,
    stats: {
        hp: template.stats.hp,
        attack: Math.floor(template.stats.attack * statMultiplier),
        defense: Math.floor(template.stats.defense * statMultiplier),
        spAttack: Math.floor(template.stats.spAttack * statMultiplier),
        spDefense: Math.floor(template.stats.spDefense * statMultiplier),
        speed: Math.floor(template.stats.speed * statMultiplier),
    },
    currentHp: maxHp,
    maxHp: maxHp,
    exp: 0,
    maxExp: 0,
    isPlayer: false,
    image: `https://img.pokemondb.net/sprites/black-white/anim/normal/${template.englishName}.gif`,
    moves: template.moves.map(m => createMove(m)).filter(m => m.id) // Ensure valid moves
  };
}

export const generateEventResult = async (context: string, choice: string): Promise<string> => {
   if (!getApiKey()) return "你继续前进。";
   try {
    const response = await getAI().models.generateContent({
      model: MODEL_NAME,
      contents: `Game Context: ${context}. Player chose: ${choice}. Describe outcome in Chinese (2 sentences).`,
    });
    return response.text || "发生了神秘的事情...";
   } catch (e) {
     return "发生了神秘的事情...";
   }
}
