
import { GoogleGenAI, Type } from "@google/genai";
import { Pokemon, PokemonType, NodeType, MoveCategory, Move } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

const uuid = () => Math.random().toString(36).substring(2, 9);

export const generateEnemy = async (floor: number, type: NodeType): Promise<Pokemon> => {
  if (!process.env.API_KEY) {
    return generateFallbackEnemy(floor);
  }

  const isBoss = type === NodeType.BOSS;
  const isElite = type === NodeType.ELITE;
  const level = 5 + floor * 2 + (isBoss ? 5 : 0);
  
  // Adjusted HP scale for Pokemon stats
  const hpScale = isBoss ? 200 : isElite ? 100 : 40 + (floor * 5);

  const systemInstruction = `
    You are a Pokemon Game Designer.
    Generate a JSON object for a single wild Pokemon enemy.
    Level: ${level}.
    Floor: ${floor}.
    Context: A Roguelike tower climber.
    
    The Pokemon must have:
    - name (Chinese)
    - types (Array of strings: Fire, Water, Grass, Normal, etc.)
    - stats: { hp, attack, defense, spAttack, spDefense, speed } (Base stats scaled to level ${level})
    - maxHp (Should be around ${hpScale})
    - moves: Array of 3-4 moves. Each move needs: name, type, category (Physical/Special/Status), power, accuracy, pp, maxPp.
    - image: A URL to a static image or gif (use specific pokemon name in URL if possible, e.g. from pokemondb or similar, otherwise a placeholder).
      Ideally: "https://img.pokemondb.net/sprites/black-white/anim/normal/[lowercase_english_name].gif"
      You MUST provide the english name for the URL generation.
  `;

  try {
    const response = await ai.models.generateContent({
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
      types: data.types as PokemonType[] || [PokemonType.NORMAL],
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
    return generateFallbackEnemy(floor);
  }
};

const generateFallbackEnemy = (floor: number): Pokemon => {
  const level = 5 + floor;
  return {
    id: `fallback-${Date.now()}`,
    name: "小拉达",
    level: level,
    types: [PokemonType.NORMAL],
    stats: { hp: 30, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72 },
    currentHp: 30 + (floor * 5),
    maxHp: 30 + (floor * 5),
    exp: 0,
    maxExp: 0,
    isPlayer: false,
    image: "https://img.pokemondb.net/sprites/black-white/anim/normal/rattata.gif",
    moves: [
      { id: 'm1', name: '撞击', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 40, accuracy: 100, pp: 35, maxPp: 35, description: '撞击' },
      { id: 'm2', name: '必杀门牙', type: PokemonType.NORMAL, category: MoveCategory.PHYSICAL, power: 80, accuracy: 90, pp: 15, maxPp: 15, description: '必杀门牙' }
    ]
  };
}

export const generateEventResult = async (context: string, choice: string): Promise<string> => {
   if (!process.env.API_KEY) return "你继续前进。";
   try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Game Context: ${context}. Player chose: ${choice}. Describe outcome in Chinese (2 sentences).`,
    });
    return response.text;
   } catch (e) {
     return "发生了神秘的事情...";
   }
}
