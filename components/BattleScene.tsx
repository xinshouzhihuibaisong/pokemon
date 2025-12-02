import React, { useState, useEffect } from 'react';
import { Pokemon, Move, MoveCategory, PokemonType } from '../types';
import Button from './Button';
import { Sword, RotateCcw, Backpack, Footprints } from 'lucide-react';

interface BattleSceneProps {
  player: Pokemon;
  enemy: Pokemon;
  onUseMove: (move: Move) => void;
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
      relative bg-yellow-50/90 border-4 border-gray-700 rounded-lg p-2 md:p-3 w-56 md:w-72 shadow-xl z-20
      ${isPlayer ? 'self-end mr-4 md:mr-8' : 'self-start ml-4 md:ml-8'}
    `}>
       <div className="flex justify-between items-baseline mb-1">
          <span className="font-bold text-gray-800 text-sm md:text-lg truncate mr-2">{name}</span>
          <span className="font-bold text-gray-800 text-xs md:text-sm whitespace-nowrap">Lv.{level}</span>
       </div>
       <div className="w-full bg-gray-700 h-3 md:h-4 rounded-full p-0.5">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }}></div>
       </div>
       <div className="text-right text-xs font-bold text-gray-600 mt-1">
          {current} / {max}
       </div>
       {/* Decorative Arrow */}
       <div className={`
          absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-yellow-50/90
          ${isPlayer ? '-bottom-2 right-8' : '-bottom-2 left-8'}
       `}></div>
    </div>
  );
}

const BattleScene: React.FC<BattleSceneProps> = ({
  player,
  enemy,
  onUseMove,
  onRun,
  battleLog,
  isPlayerTurn,
  canAct
}) => {
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
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
        default: return 'bg-gray-400 hover:bg-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-2 md:py-4 relative">
      
      {/* Battle Field */}
      <div className="flex-1 relative mb-2 min-h-[300px] md:min-h-[400px]">
         
         {/* Enemy Sprite & HUD (Top Right) */}
         <div className="flex flex-col absolute top-4 right-4 md:right-12 gap-2 md:gap-4 items-end z-10">
            <HealthBar 
               current={enemy.currentHp} 
               max={enemy.maxHp} 
               name={enemy.name} 
               level={enemy.level} 
               isPlayer={false} 
            />
            <div className="relative mt-4 mr-8 md:mr-12">
               <div className="w-32 h-3 md:w-40 md:h-4 bg-black/20 rounded-[50%] absolute bottom-0 left-1/2 -translate-x-1/2 blur-md"></div>
               <img src={enemy.image} alt={enemy.name} className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10" />
            </div>
         </div>

         {/* Player Sprite & HUD (Bottom Left) */}
         <div className="flex flex-col absolute bottom-4 left-4 md:left-12 gap-2 md:gap-4 items-start z-20">
            <div className="relative mb-4 md:mb-8 ml-8 md:ml-12">
               <div className="w-32 h-3 md:w-40 md:h-4 bg-black/20 rounded-[50%] absolute bottom-0 left-1/2 -translate-x-1/2 blur-md"></div>
               <img src={player.image} alt={player.name} className="w-32 h-32 md:w-48 md:h-48 object-contain relative z-10 hover:scale-110 transition-transform origin-bottom" />
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
      <div className="h-40 md:h-48 bg-gray-800 rounded-xl border-4 border-gray-600 p-2 flex gap-2 shadow-2xl shrink-0 z-30 relative">
         
         {/* Dialogue Box */}
         <div className="flex-1 bg-gray-900 rounded border-2 border-gray-500 p-3 md:p-4 font-mono text-white text-sm md:text-lg overflow-y-auto relative" ref={logRef}>
            {battleLog.length > 0 ? (
                <div className="flex flex-col gap-1 md:gap-2">
                    {battleLog.slice(-4).map((log, i) => (
                        <p key={i} className="animate-fade-in-up">{log}</p>
                    ))}
                    {!canAct && <span className="animate-pulse">...</span>}
                </div>
            ) : (
                <p>What will {player.name} do?</p>
            )}
         </div>

         {/* Action Menu */}
         <div className="w-2/5 md:w-1/3 bg-white/90 rounded border-l-4 md:border-l-8 border-b-4 md:border-b-8 border-gray-400 p-1 md:p-2 grid grid-cols-2 gap-1 md:gap-2 text-gray-800 font-bold text-xs md:text-base">
            {menuState === 'MAIN' && (
                <>
                    <button 
                        onClick={() => setMenuState('FIGHT')}
                        disabled={!canAct}
                        className="bg-red-500 hover:bg-red-400 text-white rounded flex flex-col items-center justify-center border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        战斗
                    </button>
                    <button 
                        onClick={() => setMenuState('BAG')} // Placeholder
                        disabled={!canAct}
                        className="bg-orange-400 hover:bg-orange-300 text-white rounded flex flex-col items-center justify-center border-b-4 border-orange-600 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        背包
                    </button>
                    <button 
                        disabled 
                        className="bg-green-500 hover:bg-green-400 text-white rounded flex flex-col items-center justify-center border-b-4 border-green-700 opacity-50 cursor-not-allowed"
                    >
                        宝可梦
                    </button>
                    <button 
                        onClick={onRun}
                        disabled={!canAct}
                        className="bg-blue-500 hover:bg-blue-400 text-white rounded flex flex-col items-center justify-center border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all"
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
                           className={`${getTypeColor(move.type)} text-white p-0.5 rounded border-b-2 md:border-b-4 border-black/20 active:border-b-0 active:translate-y-0.5 flex flex-col items-center justify-center relative overflow-hidden`}
                           disabled={move.pp === 0}
                        >
                           <span className="font-bold text-[10px] md:text-xs">{move.name}</span>
                           <span className="text-[9px] md:text-[10px] opacity-80">{move.pp}/{move.maxPp} PP</span>
                           {move.pp === 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-500 font-bold rotate-12 text-xs">NO PP</div>}
                        </button>
                    ))}
                    <button 
                        onClick={() => setMenuState('MAIN')}
                        className="col-span-2 bg-gray-300 hover:bg-gray-200 text-gray-700 rounded h-6 md:h-8 border-b-2 md:border-b-4 border-gray-400 active:border-b-0 active:translate-y-0.5 text-xs md:text-sm"
                    >
                        返回
                    </button>
                </>
            )}

             {menuState === 'BAG' && (
                <div className="col-span-2 flex flex-col items-center justify-center h-full">
                    <p className="text-xs">背包空空如也...</p>
                    <button onClick={() => setMenuState('MAIN')} className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded">返回</button>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default BattleScene;