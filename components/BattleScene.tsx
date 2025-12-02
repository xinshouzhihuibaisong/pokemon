
import React, { useState, useEffect } from 'react';
import { Pokemon, Move, MoveCategory, PokemonType, Item } from '../types';
import Button from './Button';
import { Sword, RotateCcw, Backpack, Footprints, X } from 'lucide-react';

interface BattleSceneProps {
  player: Pokemon;
  enemy: Pokemon;
  bag: Item[];
  onUseMove: (move: Move) => void;
  onUseItem: (item: Item) => void;
  onRun: () => void;
  battleLog: string[];
  isPlayerTurn: boolean;
  canAct: boolean;
}

const HealthBar = ({ current, max, name, level, isPlayer }: { current: number, max: number, name: string, level: number, isPlayer: boolean }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  const color = percent > 50 ? 'bg-green-500' : percent > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`
      relative bg-yellow-50/90 border-4 border-gray-700 rounded-lg p-2 md:p-3 w-48 md:w-64 shadow-xl z-20 pointer-events-auto
      transition-transform duration-300
    `}>
       <div className="flex justify-between items-baseline mb-1">
          <span className="font-bold text-gray-800 text-sm md:text-base truncate mr-2">{name}</span>
          <span className="font-bold text-gray-800 text-xs whitespace-nowrap">Lv.{level}</span>
       </div>
       <div className="w-full bg-gray-700 h-3 md:h-4 rounded-full p-0.5">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }}></div>
       </div>
       <div className="text-right text-xs font-bold text-gray-600 mt-1">
          {current} / {max}
       </div>
       {/* Decorative Arrow */}
       <div className={`
          absolute w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-yellow-50/90
          ${isPlayer ? '-bottom-2 right-8' : '-bottom-2 left-8'}
       `}></div>
    </div>
  );
}

const BattleScene: React.FC<BattleSceneProps> = ({
  player,
  enemy,
  bag,
  onUseMove,
  onUseItem,
  onRun,
  battleLog,
  isPlayerTurn,
  canAct
}) => {
  const [menuState, setMenuState] = useState<'MAIN' | 'FIGHT' | 'BAG'>('MAIN');

  // Auto-scroll log
  const logRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleLog]);

  const getTypeColor = (type: PokemonType) => {
    switch(type) {
        case PokemonType.FIRE: return 'bg-orange-500 hover:bg-orange-400';
        case PokemonType.WATER: return 'bg-blue-500 hover:bg-blue-400';
        case PokemonType.GRASS: return 'bg-green-600 hover:bg-green-500';
        case PokemonType.ELECTRIC: return 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900';
        case PokemonType.PSYCHIC: return 'bg-pink-500 hover:bg-pink-400';
        case PokemonType.ROCK: return 'bg-stone-500 hover:bg-stone-400';
        case PokemonType.GHOST: return 'bg-purple-600 hover:bg-purple-500';
        case PokemonType.DRAGON: return 'bg-indigo-600 hover:bg-indigo-500';
        case PokemonType.STEEL: return 'bg-gray-400 hover:bg-gray-300';
        case PokemonType.FAIRY: return 'bg-pink-300 hover:bg-pink-200';
        default: return 'bg-gray-400 hover:bg-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-2 relative overflow-hidden">
      
      {/* Battle Field */}
      <div className="flex-1 relative w-full min-h-[350px] flex flex-col justify-between p-4">
         
         {/* Enemy Section (Top Right) */}
         <div className="flex flex-col items-end self-end w-full max-w-[50%] z-10 mr-2 md:mr-12 animate-fade-in">
            <HealthBar 
               current={enemy.currentHp} 
               max={enemy.maxHp} 
               name={enemy.name} 
               level={enemy.level} 
               isPlayer={false} 
            />
            <div className="relative mt-4 mr-8">
               <div className="w-24 h-3 md:w-32 md:h-4 bg-black/20 rounded-[50%] absolute bottom-0 left-1/2 -translate-x-1/2 blur-md"></div>
               <img src={enemy.image} alt={enemy.name} className="w-24 h-24 md:w-40 md:h-40 object-contain relative z-10" />
            </div>
         </div>

         {/* Player Section (Bottom Left) */}
         <div className="flex flex-col items-start self-start w-full max-w-[50%] z-20 ml-2 md:ml-12 mb-4 animate-fade-in">
            <div className="relative mb-4 ml-8">
               <div className="w-24 h-3 md:w-32 md:h-4 bg-black/20 rounded-[50%] absolute bottom-0 left-1/2 -translate-x-1/2 blur-md"></div>
               <img src={player.image} alt={player.name} className="w-24 h-24 md:w-40 md:h-40 object-contain relative z-10 hover:scale-110 transition-transform origin-bottom cursor-pointer" />
            </div>
            <HealthBar 
               current={player.currentHp} 
               max={player.maxHp} 
               name={player.name} 
               level={player.level} 
               isPlayer={true} 
            />
         </div>
      </div>

      {/* Control Panel (Gameboy Style) */}
      <div className="h-44 bg-gray-800 rounded-xl border-4 border-gray-600 p-2 flex gap-2 shadow-2xl shrink-0 z-30 mx-2 mb-2">
         
         {/* Dialogue Box */}
         <div className="flex-1 bg-gray-900 rounded border-2 border-gray-500 p-3 font-mono text-white text-sm md:text-base overflow-y-auto relative shadow-inner" ref={logRef}>
            {battleLog.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {battleLog.slice(-4).map((log, i) => (
                        <p key={i} className="animate-fade-in-up leading-tight">{log}</p>
                    ))}
                    {!canAct && <span className="animate-pulse text-yellow-400">...</span>}
                </div>
            ) : (
                <p>What will {player.name} do?</p>
            )}
         </div>

         {/* Action Menu */}
         <div className="w-[140px] md:w-[200px] bg-white/90 rounded border-l-4 border-b-4 border-gray-400 p-1 grid grid-cols-2 gap-1 text-gray-800 font-bold text-xs md:text-sm shadow-inner overflow-hidden">
            {menuState === 'MAIN' && (
                <>
                    <button 
                        onClick={() => setMenuState('FIGHT')}
                        disabled={!canAct}
                        className="bg-red-100 hover:bg-red-200 text-gray-900 rounded flex flex-col items-center justify-center border-b-2 border-red-300 active:border-b-0 active:translate-y-0.5 transition-all"
                    >
                        战斗
                    </button>
                    <button 
                        onClick={() => setMenuState('BAG')}
                        disabled={!canAct}
                        className="bg-orange-100 hover:bg-orange-200 text-gray-900 rounded flex flex-col items-center justify-center border-b-2 border-orange-300 active:border-b-0 active:translate-y-0.5 transition-all"
                    >
                        背包
                    </button>
                    <button 
                        disabled 
                        className="bg-green-100 text-gray-400 rounded flex flex-col items-center justify-center border-b-2 border-green-200 cursor-not-allowed"
                    >
                        宝可梦
                    </button>
                    <button 
                        onClick={onRun}
                        disabled={!canAct}
                        className="bg-blue-100 hover:bg-blue-200 text-gray-900 rounded flex flex-col items-center justify-center border-b-2 border-blue-300 active:border-b-0 active:translate-y-0.5 transition-all"
                    >
                        逃跑
                    </button>
                </>
            )}

            {menuState === 'FIGHT' && (
                <>
                    {player.moves.map((move) => (
                        <button
                           key={move.id}
                           onClick={() => onUseMove(move)}
                           className={`${getTypeColor(move.type)} text-white p-0.5 rounded border-b-2 border-black/20 active:border-b-0 active:translate-y-0.5 flex flex-col items-center justify-center relative overflow-hidden transition-all`}
                           disabled={move.pp === 0}
                        >
                           <span className="font-bold text-[10px] md:text-xs z-10 relative drop-shadow-md">{move.name}</span>
                           <span className="text-[9px] md:text-[10px] opacity-90 z-10 relative">{move.pp}/{move.maxPp}</span>
                           {move.pp === 0 && <div className="absolute inset-0 bg-gray-800/80 z-20 flex items-center justify-center text-red-400 font-bold rotate-12 text-xs">NO PP</div>}
                        </button>
                    ))}
                    <button 
                        onClick={() => setMenuState('MAIN')}
                        className="col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded h-6 border-b-2 border-gray-400 active:border-b-0 active:translate-y-0.5 text-xs"
                    >
                        返回
                    </button>
                </>
            )}

             {menuState === 'BAG' && (
                <div className="col-span-2 flex flex-col h-full relative">
                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1">
                        {bag.length === 0 ? (
                            <p className="text-[10px] text-gray-500 text-center mt-4">背包空空如也...</p>
                        ) : (
                            bag.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onUseItem(item)}
                                    className="flex items-center justify-between bg-white border border-gray-300 rounded p-1 hover:bg-gray-50 text-[10px] text-left"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>{item.icon}</span>
                                        <span className="font-bold">{item.name}</span>
                                    </div>
                                    <span className="bg-gray-200 px-1 rounded-full text-[9px]">x{item.count}</span>
                                </button>
                            ))
                        )}
                    </div>
                    <button onClick={() => setMenuState('MAIN')} className="mt-1 text-xs bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 shrink-0">返回</button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default BattleScene;
