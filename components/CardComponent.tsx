
import React from 'react';
import { Move, PokemonType, MoveCategory } from '../types';
import { Sword, Zap, Heart, Activity, Target, Disc } from 'lucide-react';

interface MoveCardProps {
  move: Move;
  onClick?: () => void;
  selected?: boolean;
}

const getTypeColor = (type: PokemonType) => {
  switch(type) {
    case PokemonType.FIRE: return 'bg-orange-600 border-orange-400';
    case PokemonType.WATER: return 'bg-blue-600 border-blue-400';
    case PokemonType.GRASS: return 'bg-green-600 border-green-400';
    case PokemonType.ELECTRIC: return 'bg-yellow-500 border-yellow-300 text-yellow-900';
    case PokemonType.PSYCHIC: return 'bg-pink-600 border-pink-400';
    case PokemonType.ROCK: return 'bg-stone-600 border-stone-400';
    case PokemonType.GHOST: return 'bg-purple-800 border-purple-500';
    default: return 'bg-gray-500 border-gray-300';
  }
};

const MoveCard: React.FC<MoveCardProps> = ({ move, onClick, selected }) => {
  const colorClass = getTypeColor(move.type);
  
  return (
    <div 
      onClick={onClick}
      className={`
        relative w-56 h-auto min-h-[12rem] rounded-xl border-4 p-4 flex flex-col gap-2 select-none
        transition-all duration-200 cursor-pointer shadow-lg
        ${colorClass}
        ${selected ? 'ring-4 ring-white scale-105 z-10' : 'hover:scale-105'}
        text-white
      `}
    >
      <div className="flex justify-between items-center border-b border-white/30 pb-2">
        <span className="font-bold text-lg font-display tracking-wider">{move.name}</span>
        <span className="text-xs font-mono uppercase bg-black/20 px-2 py-0.5 rounded">{move.type}</span>
      </div>

      <div className="flex justify-between text-sm font-bold mt-1">
         <div className="flex items-center gap-1">
            {move.category === MoveCategory.PHYSICAL && <Sword size={14} />}
            {move.category === MoveCategory.SPECIAL && <Zap size={14} />}
            {move.category === MoveCategory.STATUS && <Activity size={14} />}
            <span>{move.category === MoveCategory.STATUS ? '变化' : move.category === MoveCategory.PHYSICAL ? '物理' : '特殊'}</span>
         </div>
         <div className="flex items-center gap-1">
            <Target size={14} />
            <span>{move.power > 0 ? move.power : '-'}</span>
         </div>
      </div>

      <div className="flex-1 bg-black/20 rounded p-2 text-xs leading-relaxed my-2 flex items-center">
         {move.description}
      </div>

      <div className="flex justify-between items-center text-xs font-mono bg-black/30 rounded px-2 py-1">
         <span>PP {move.pp}/{move.maxPp}</span>
         <span>命中 {move.accuracy}</span>
      </div>
    </div>
  );
};

export default MoveCard;
