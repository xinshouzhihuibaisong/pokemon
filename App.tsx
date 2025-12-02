
import React, { useState, useEffect } from 'react';
import { 
  GameState, GameStatus, NodeType, MapNode, Pokemon, PokemonType, Move, MoveCategory, Item 
} from './types';
import { STARTER_POKEMON, TYPE_CHART, getEffectiveness, REWARD_MOVES_POOL, REWARD_ITEMS_POOL, createMove, createItem, ITEMS_DB } from './constants';
import GameMap from './components/GameMap';
import BattleScene from './components/BattleScene';
import Button from './components/Button';
import MoveCard from './components/CardComponent';
import { generateEnemy, generateEventResult } from './services/geminiService';
import { Award, Skull, Gift, HelpCircle } from 'lucide-react';

const generateMap = (length: number = 10): MapNode[] => {
  const nodes: MapNode[] = [];
  // Floor 0: Start
  nodes.push({ id: 'start', type: NodeType.START, x: 0, y: 1, children: [], completed: true, locked: false });
  
  const widths = [1, 2, 2, 3, 2, 3, 2, 2, 1, 1]; // Nodes per floor
  let previousFloorIds = ['start'];

  for (let i = 1; i < length; i++) {
    const width = widths[i] || 1;
    const currentFloorIds: string[] = [];
    
    for (let j = 0; j < width; j++) {
       const id = `node-${i}-${j}`;
       let type = NodeType.COMBAT;
       
       if (i === length - 1) type = NodeType.BOSS;
       else if (i === 4) type = NodeType.ELITE;
       else if (i % 3 === 0) type = Math.random() > 0.5 ? NodeType.EVENT : NodeType.REST;
       else type = Math.random() > 0.7 ? NodeType.EVENT : NodeType.COMBAT;

       nodes.push({
         id,
         type,
         x: i,
         y: j,
         children: [],
         completed: false,
         locked: true
       });
       currentFloorIds.push(id);
    }

    previousFloorIds.forEach(prevId => {
      const parent = nodes.find(n => n.id === prevId);
      if (parent) {
         const targets = currentFloorIds.filter(() => Math.random() > 0.3);
         if (targets.length === 0) targets.push(currentFloorIds[0]); 
         parent.children = targets;
      }
    });

    previousFloorIds = currentFloorIds;
  }
  return nodes;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: GameStatus.MENU,
    player: {} as Pokemon,
    bag: [createItem('potion', 2)], // Start with 2 Potions
    currentEnemy: null,
    floor: 0,
    map: [],
    currentNodeId: null,
    loading: false,
    loadingMessage: '',
    battleLog: []
  });

  const [rewardOptions, setRewardOptions] = useState<Move[]>([]);
  const [rewardItem, setRewardItem] = useState<Item | null>(null);
  const [canAct, setCanAct] = useState(true);

  // --- Actions ---

  const startGame = (element: 'FIRE' | 'WATER' | 'GRASS') => {
    const template = STARTER_POKEMON[element] as Pokemon;
    // Deep copy
    const starter: Pokemon = {
        ...template,
        id: 'player',
        currentHp: template.maxHp,
        isPlayer: true,
        moves: template.moves!.map(m => ({...m}))
    };
    
    setGameState({
      status: GameStatus.MAP,
      player: starter,
      bag: [createItem('potion', 2)],
      currentEnemy: null,
      floor: 0,
      map: generateMap(11),
      currentNodeId: 'start',
      loading: false,
      loadingMessage: '',
      battleLog: []
    });
  };

  const navigateToNode = async (node: MapNode) => {
    setGameState(prev => ({
      ...prev,
      currentNodeId: node.id,
      floor: node.x,
      loading: true,
      loadingMessage: '探索中...'
    }));

    if (node.type === NodeType.COMBAT || node.type === NodeType.ELITE || node.type === NodeType.BOSS) {
       setGameState(prev => ({ ...prev, loadingMessage: '遭遇野生的幻兽！正在生成...' }));
       const enemy = await generateEnemy(node.x, node.type);
       
       setGameState(prev => ({
         ...prev,
         status: GameStatus.COMBAT,
         currentEnemy: enemy,
         loading: false,
         battleLog: [`遭遇了野生的 ${enemy.name}!`, `去吧, ${prev.player.name}!`]
       }));
       setCanAct(true);

    } else if (node.type === NodeType.REST) {
        setGameState(prev => ({ ...prev, status: GameStatus.REST, loading: false }));
    } else if (node.type === NodeType.EVENT) {
        // Generate random event
        const events = [
            {
                title: '神秘的喷泉',
                description: '你发现了一个散发着光芒的喷泉。',
                choices: [
                    { text: '喝一口 (回复所有HP)', action: () => handleEventEffect('HEAL_FULL') },
                    { text: '离开', action: () => handleEventEffect('LEAVE') }
                ]
            },
            {
                title: '遗落的背包',
                description: '地上有一个看起来像是训练家遗落的背包。',
                choices: [
                    { text: '打开看看 (获得道具)', action: () => handleEventEffect('GET_ITEM') },
                    { text: '无视', action: () => handleEventEffect('LEAVE') }
                ]
            },
            {
                title: '奇怪的雕像',
                description: '一个古老的宝可梦雕像，似乎想要什么供品。',
                choices: [
                    { text: '献祭HP (失去HP，提升攻击)', action: () => handleEventEffect('TRADE_HP_ATK') },
                    { text: '离开', action: () => handleEventEffect('LEAVE') }
                ]
            }
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];

        setGameState(prev => ({ 
            ...prev, 
            status: GameStatus.EVENT, 
            loading: false,
            eventData: randomEvent
        }));
    }
  };

  const handleEventEffect = (effect: string) => {
      setGameState(prev => {
          let player = { ...prev.player };
          let bag = [ ...prev.bag ];
          let newMap = prev.map.map(n => n.id === prev.currentNodeId ? { ...n, completed: true } : n);

          if (effect === 'HEAL_FULL') {
              player.currentHp = player.maxHp;
          } else if (effect === 'GET_ITEM') {
              const itemKeys = Object.keys(ITEMS_DB);
              const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
              const existingItem = bag.find(i => i.name === ITEMS_DB[randomKey].name); // loose match by name for simplicity
              if (existingItem) {
                  existingItem.count++;
              } else {
                  bag.push(createItem(randomKey));
              }
          } else if (effect === 'TRADE_HP_ATK') {
              player.currentHp = Math.max(1, player.currentHp - 10);
              player.stats.attack += 5;
              player.stats.spAttack += 5;
          }

          return {
              ...prev,
              player,
              bag,
              map: newMap,
              status: GameStatus.MAP,
              eventData: null
          };
      });
  };

  // --- Combat Engine ---

  const calculateDamage = (attacker: Pokemon, defender: Pokemon, move: Move) => {
     if (move.category === MoveCategory.STATUS) return { damage: 0, typeEff: 0 };

     const a = move.category === MoveCategory.PHYSICAL ? attacker.stats.attack : attacker.stats.spAttack;
     const d = move.category === MoveCategory.PHYSICAL ? defender.stats.defense : defender.stats.spDefense;
     
     let damage = ((2 * attacker.level / 5 + 2) * move.power * a / d) / 50 + 2;

     if (attacker.types.includes(move.type)) damage *= 1.5;
     const typeEff = getEffectiveness(move.type, defender.types);
     damage *= typeEff;
     damage *= (Math.random() * 0.15 + 0.85);

     return { damage: Math.floor(damage), typeEff };
  };

  const useItemTurn = async (item: Item) => {
      if (!gameState.currentEnemy || !canAct) return;
      setCanAct(false);
      
      let logs = [...gameState.battleLog];
      let player = { ...gameState.player };
      let bag = [ ...gameState.bag ];

      // Apply Item Effect
      logs.push(`你使用了 ${item.name}!`);
      
      if (item.effectType === 'HEAL_HP') {
          const healAmount = item.value;
          player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
          logs.push(`${player.name} 回复了体力!`);
      } else if (item.effectType === 'BUFF_ATK') {
          player.stats.attack = Math.floor(player.stats.attack * item.value);
          player.stats.spAttack = Math.floor(player.stats.spAttack * item.value);
          logs.push(`${player.name} 的攻击力提高了!`);
      } else if (item.effectType === 'BUFF_DEF') {
          player.stats.defense = Math.floor(player.stats.defense * item.value);
          player.stats.spDefense = Math.floor(player.stats.spDefense * item.value);
          logs.push(`${player.name} 的防御力提高了!`);
      }

      // Consume Item
      const itemIndex = bag.findIndex(i => i.id === item.id);
      if (itemIndex > -1) {
          bag[itemIndex].count--;
          if (bag[itemIndex].count <= 0) {
              bag.splice(itemIndex, 1);
          }
      }

      setGameState(prev => ({ ...prev, player, bag, battleLog: logs }));
      await new Promise(r => setTimeout(r, 1000));

      // Enemy Turn
      const enemy = { ...gameState.currentEnemy };
      await enemyTurn(player, enemy, logs);
  };

  const enemyTurn = async (player: Pokemon, enemy: Pokemon, logs: string[]) => {
      if (enemy.currentHp <= 0) return; // Should not happen but safety

      const enemyMove = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];
      await performAction(enemy, player, enemyMove, logs, setGameState);
      
      if (player.currentHp <= 0) {
          await handleFaint(player, logs, enemy);
      } else {
          setCanAct(true);
      }
  };

  const executeTurn = async (playerMove: Move) => {
      if (!gameState.currentEnemy || !canAct) return;
      setCanAct(false);

      const player = { ...gameState.player };
      const enemy = { ...gameState.currentEnemy };
      let logs = [...gameState.battleLog];

      const pMoveIdx = player.moves.findIndex(m => m.id === playerMove.id);
      if (pMoveIdx >= 0) player.moves[pMoveIdx].pp--;

      const playerSpeed = player.stats.speed;
      const enemySpeed = enemy.stats.speed;
      let first = player;
      let second = enemy;
      let firstMove = playerMove;
      
      const enemyMove = enemy.moves[Math.floor(Math.random() * enemy.moves.length)];

      let secondMove = enemyMove;
      let playerGoesFirst = true;

      if (enemySpeed > playerSpeed) {
         first = enemy;
         second = player;
         firstMove = enemyMove;
         secondMove = playerMove;
         playerGoesFirst = false;
      } else if (enemySpeed === playerSpeed && Math.random() > 0.5) {
         first = enemy;
         second = player;
         firstMove = enemyMove;
         secondMove = playerMove;
         playerGoesFirst = false;
      }

      await performAction(first, second, firstMove, logs, setGameState);
      if (second.currentHp <= 0) {
         await handleFaint(second, logs, playerGoesFirst ? enemy : player);
         return;
      }

      await new Promise(r => setTimeout(r, 1000));
      await performAction(second, first, secondMove, logs, setGameState);
      if (first.currentHp <= 0) {
         await handleFaint(first, logs, playerGoesFirst ? player : enemy);
         return;
      }

      setCanAct(true);
  };

  const performAction = async (
      attacker: Pokemon, 
      defender: Pokemon, 
      move: Move, 
      logs: string[],
      setState: React.Dispatch<React.SetStateAction<GameState>>
    ) => {
      
      logs.push(`${attacker.name} 使用了 ${move.name}!`);
      setState(prev => ({ ...prev, battleLog: [...logs] }));
      await new Promise(r => setTimeout(r, 800));

      if (move.category === MoveCategory.STATUS) {
         if (move.effect === 'HEAL') {
             const heal = Math.floor(attacker.maxHp * 0.5);
             attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + heal);
             logs.push(`${attacker.name} 回复了体力!`);
         } else if (move.effect === 'DEBUFF_DEF') {
             logs.push(`${defender.name} 的防御降低了!`);
         }
      } else {
         const { damage, typeEff } = calculateDamage(attacker, defender, move);
         defender.currentHp = Math.max(0, defender.currentHp - damage);
         
         if (typeEff > 1) logs.push("效果拔群!");
         if (typeEff < 1 && typeEff > 0) logs.push("效果不好...");
         if (typeEff === 0) logs.push("似乎没有效果...");
      }
      
      setState(prev => ({
         ...prev,
         player: attacker.isPlayer ? attacker : defender,
         currentEnemy: !attacker.isPlayer ? attacker : defender,
         battleLog: [...logs]
      }));
  };

  const handleFaint = async (fainted: Pokemon, logs: string[], winner: Pokemon) => {
      logs.push(`${fainted.name} 倒下了!`);
      setGameState(prev => ({ ...prev, battleLog: [...logs] }));
      await new Promise(r => setTimeout(r, 1000));

      if (fainted.isPlayer) {
          setGameState(prev => ({ ...prev, status: GameStatus.GAME_OVER }));
      } else {
          logs.push(`${winner.name} 获得了经验值!`);
          winner.exp += 50; 
          if (winner.exp >= 100) { 
             winner.level++;
             winner.exp = 0;
             winner.maxHp += 5;
             winner.stats.attack += 2;
             winner.stats.defense += 2;
             winner.stats.spAttack += 2;
             winner.stats.spDefense += 2;
             winner.stats.speed += 2;
             winner.currentHp = winner.maxHp; 
             logs.push(`${winner.name} 升到了 Lv.${winner.level}!`);
          }

          setGameState(prev => ({ ...prev, player: winner, battleLog: [...logs] }));
          await new Promise(r => setTimeout(r, 1000));
          
          handleVictory();
      }
  };

  const handleVictory = () => {
      // Generate Move Rewards
      const pool = REWARD_MOVES_POOL;
      const options = [];
      for(let i=0; i<3; i++) {
          const key = pool[Math.floor(Math.random() * pool.length)];
          options.push(createMove(key));
      }
      setRewardOptions(options);

      // Chance for Item Reward
      if (Math.random() > 0.5) {
          const itemPool = REWARD_ITEMS_POOL;
          const key = itemPool[Math.floor(Math.random() * itemPool.length)];
          setRewardItem(createItem(key));
      } else {
          setRewardItem(null);
      }

      setGameState(prev => ({ ...prev, status: GameStatus.REWARD }));
  };

  const selectReward = (move: Move | null) => {
      setGameState(prev => {
          let newPlayer = { ...prev.player };
          if (move) {
              if (newPlayer.moves.length < 4) {
                  newPlayer.moves.push(move);
              } else {
                  newPlayer.moves[0] = move; 
              }
          }
          
          // Add item if exists
          let newBag = [...prev.bag];
          if (rewardItem) {
               const existing = newBag.find(i => i.name === rewardItem.name);
               if (existing) existing.count++;
               else newBag.push(rewardItem);
          }

          const newMap = prev.map.map(n => n.id === prev.currentNodeId ? { ...n, completed: true } : n);
          return {
              ...prev,
              player: newPlayer,
              bag: newBag,
              map: newMap,
              status: GameStatus.MAP,
              currentEnemy: null
          };
      });
  };

  const restAction = () => {
      setGameState(prev => {
          const healedHp = Math.min(prev.player.maxHp, prev.player.currentHp + Math.floor(prev.player.maxHp * 0.5));
          const newMap = prev.map.map(n => n.id === prev.currentNodeId ? { ...n, completed: true } : n);
          
          // Restore PP
          const newMoves = prev.player.moves.map(m => ({ ...m, pp: m.maxPp }));

          return {
              ...prev,
              player: { ...prev.player, currentHp: healedHp, moves: newMoves },
              map: newMap,
              status: GameStatus.MAP
          };
      });
  };

  const runAway = () => {
      setGameState(prev => ({
          ...prev,
          status: GameStatus.MAP,
          currentEnemy: null,
          battleLog: []
      }));
  }

  // --- Render ---

  if (gameState.loading) {
     return (
       <div className="min-h-screen bg-black flex items-center justify-center text-white">
          <div className="text-center">
             <div className="w-16 h-16 border-4 border-white border-b-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-xl font-mono">{gameState.loadingMessage}</p>
          </div>
       </div>
     );
  }

  if (gameState.status === GameStatus.MENU) {
     return (
       <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 blur-sm"></div>
          
          <h1 className="text-6xl md:text-8xl font-display text-yellow-400 mb-4 z-10 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] text-center tracking-wider">
            幻兽高塔
          </h1>
          <p className="text-xl text-gray-300 mb-12 z-10 font-mono tracking-widest">POKEMON ROGUELIKE</p>

          <div className="flex gap-8 z-10">
             <button onClick={() => startGame('GRASS')} className="group relative w-40 h-56 bg-green-900/80 rounded-xl border-4 border-green-600 hover:scale-110 transition-transform overflow-hidden flex flex-col items-center justify-center">
                <img src={STARTER_POKEMON.GRASS.image} className="w-24 h-24 object-contain mb-4 z-10" />
                <span className="text-green-300 font-bold text-xl z-10">草系</span>
                <div className="absolute inset-0 bg-green-500/20 group-hover:bg-green-500/40 transition-colors"></div>
             </button>
             <button onClick={() => startGame('FIRE')} className="group relative w-40 h-56 bg-red-900/80 rounded-xl border-4 border-red-600 hover:scale-110 transition-transform overflow-hidden flex flex-col items-center justify-center">
                <img src={STARTER_POKEMON.FIRE.image} className="w-24 h-24 object-contain mb-4 z-10" />
                <span className="text-red-300 font-bold text-xl z-10">火系</span>
                <div className="absolute inset-0 bg-red-500/20 group-hover:bg-red-500/40 transition-colors"></div>
             </button>
             <button onClick={() => startGame('WATER')} className="group relative w-40 h-56 bg-blue-900/80 rounded-xl border-4 border-blue-600 hover:scale-110 transition-transform overflow-hidden flex flex-col items-center justify-center">
                <img src={STARTER_POKEMON.WATER.image} className="w-24 h-24 object-contain mb-4 z-10" />
                <span className="text-blue-300 font-bold text-xl z-10">水系</span>
                <div className="absolute inset-0 bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors"></div>
             </button>
          </div>
       </div>
     );
  }

  if (gameState.status === GameStatus.MAP) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
         <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shadow-md z-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-500 overflow-hidden">
                    <img src={gameState.player.image} className="w-full h-full object-contain" />
               </div>
               <div>
                  <div className="font-bold text-sm">{gameState.player.name} <span className="text-yellow-400">Lv.{gameState.player.level}</span></div>
                  <div className="text-xs text-gray-400">HP {gameState.player.currentHp}/{gameState.player.maxHp}</div>
               </div>
            </div>
            <div className="font-display text-xl text-gray-500">
               FLOOR {gameState.map.find(n => n.id === gameState.currentNodeId)?.x || 0}
            </div>
         </div>
         <GameMap 
            nodes={gameState.map} 
            currentNodeId={gameState.currentNodeId} 
            onNodeSelect={navigateToNode} 
         />
      </div>
    );
  }

  if (gameState.status === GameStatus.COMBAT && gameState.currentEnemy) {
    return (
       <div className="min-h-screen bg-gray-800 flex flex-col relative overflow-hidden">
          {/* Background patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full blur-3xl"></div>
          </div>

          <BattleScene 
             player={gameState.player}
             enemy={gameState.currentEnemy}
             bag={gameState.bag}
             onUseMove={executeTurn}
             onUseItem={useItemTurn}
             onRun={runAway}
             battleLog={gameState.battleLog}
             isPlayerTurn={canAct}
             canAct={canAct}
          />
       </div>
    );
  }

  if (gameState.status === GameStatus.EVENT && gameState.eventData) {
      return (
          <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
              <div className="max-w-lg w-full bg-gray-800 border-2 border-gray-600 rounded-lg p-8 shadow-2xl relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 p-4 rounded-full border-2 border-gray-600">
                      <HelpCircle size={48} className="text-yellow-500" />
                  </div>
                  <h2 className="text-3xl font-display text-center mt-6 mb-4">{gameState.eventData.title}</h2>
                  <p className="text-gray-300 text-center mb-8 leading-relaxed">{gameState.eventData.description}</p>
                  
                  <div className="flex flex-col gap-3">
                      {gameState.eventData.choices.map((choice, idx) => (
                          <Button key={idx} variant="secondary" onClick={choice.action} className="w-full text-left justify-center">
                              {choice.text}
                          </Button>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  if (gameState.status === GameStatus.REWARD) {
     return (
       <div className="min-h-screen bg-gray-900/95 text-white flex flex-col items-center justify-center p-8 z-50 absolute inset-0">
          <h2 className="text-3xl font-display text-yellow-400 mb-2">战斗胜利!</h2>
          
          {rewardItem && (
             <div className="mb-8 bg-gray-800 p-4 rounded-lg border border-gray-600 flex items-center gap-4 animate-bounce">
                <Gift className="text-yellow-400" size={32} />
                <div>
                   <p className="text-sm text-gray-400">获得道具</p>
                   <p className="font-bold text-lg text-white">{rewardItem.name}</p>
                </div>
             </div>
          )}

          <p className="mb-8 text-gray-400">选择一个新招式来学习 (将替换第一个招式):</p>
          
          <div className="flex gap-6 mb-12 flex-wrap justify-center">
             {rewardOptions.map(move => (
                <div key={move.id} className="hover:scale-105 transition-transform">
                   <MoveCard move={move} onClick={() => selectReward(move)} />
                   <div className="mt-4 text-center">
                      <Button size="sm" onClick={() => selectReward(move)}>学习 {move.name}</Button>
                   </div>
                </div>
             ))}
          </div>
          
          <Button variant="secondary" onClick={() => selectReward(null)}>不学习新招式</Button>
       </div>
     );
  }

  if (gameState.status === GameStatus.REST) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1493119508027-2b584f6b189e?auto=format&fit=crop&q=80')] bg-cover">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
           <div className="relative z-10 text-center max-w-lg bg-black/80 p-12 rounded-xl border-2 border-white/20 shadow-2xl">
              <div className="text-6xl mb-4">⛺</div>
              <h2 className="text-3xl font-display mb-4">宝可梦中心 (野外版)</h2>
              <p className="text-gray-300 mb-8">乔伊小姐不在，但你可以休息一下。</p>
              
              <button onClick={restAction} className="w-full bg-pink-600 hover:bg-pink-500 text-white p-4 rounded-lg font-bold text-xl transition-all flex items-center justify-center gap-3">
                 <Award />
                 回复体力 & PP
              </button>
           </div>
        </div>
      )
  }

  if (gameState.status === GameStatus.GAME_OVER) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
         <Skull size={64} className="text-gray-600 mb-4" />
         <h1 className="text-6xl font-display text-red-600 mb-4">眼前一黑...</h1>
         <p className="text-xl text-gray-500 mb-12">在这个高塔中倒下了。</p>
         <Button variant="primary" size="lg" onClick={() => setGameState({ ...gameState, status: GameStatus.MENU })}>
            再次挑战
         </Button>
      </div>
    );
  }

  return <div>Unknown State</div>;
};

export default App;
