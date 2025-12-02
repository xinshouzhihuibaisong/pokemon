import React from 'react';
import { MapNode, NodeType } from '../types';
import { Skull, Swords, Tent, Star, HelpCircle } from 'lucide-react';

interface GameMapProps {
  nodes: MapNode[];
  currentNodeId: string | null;
  onNodeSelect: (node: MapNode) => void;
}

const GameMap: React.FC<GameMapProps> = ({ nodes, currentNodeId, onNodeSelect }) => {
  // Group by floors (x-axis conceptually, but rendered vertically or horizontally)
  // Let's render vertically: Bottom is start, Top is Boss.
  
  // Find max X to determine height
  const maxX = Math.max(...nodes.map(n => n.x));
  
  // Reverse X so Boss (highest number) is at top
  const floors = Array.from({ length: maxX + 1 }, (_, i) => i).reverse();

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.START: return <Star size={20} />;
      case NodeType.COMBAT: return <Swords size={20} />;
      case NodeType.ELITE: return <Skull size={20} className="text-red-500" />;
      case NodeType.REST: return <Tent size={20} />;
      case NodeType.EVENT: return <HelpCircle size={20} />;
      case NodeType.BOSS: return <Skull size={32} className="text-purple-500" />;
      default: return <Swords size={20} />;
    }
  };

  const isNodeSelectable = (node: MapNode) => {
    if (!currentNodeId) return node.type === NodeType.START; // Only start is selectable initially (or if handled externally)
    
    // Find current node
    const currentNode = nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return false;

    // Is this node a child of current node?
    return currentNode.children.includes(node.id);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10 w-full max-w-2xl mx-auto overflow-y-auto h-[80vh]">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-display text-yellow-500 mb-2">高塔地图</h2>
        <p className="text-gray-400 text-sm">选择你的路径，向上攀登</p>
      </div>
      
      <div className="relative w-full flex flex-col gap-12 px-10 pb-20">
         {/* SVG Lines Connector (Simplistic implementation) */}
         {/* This is complex to render perfectly in react without a library, 
             so we will rely on visual proximity and implicit lines or just icons for this demo */}
         
         {floors.map(floorIndex => {
            const floorNodes = nodes.filter(n => n.x === floorIndex);
            return (
              <div key={floorIndex} className="flex justify-center gap-16 relative">
                 {/* Floor Label */}
                 <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono">
                    FLOOR {floorIndex}
                 </div>

                 {floorNodes.map(node => {
                   const selectable = isNodeSelectable(node);
                   const isCurrent = node.id === currentNodeId;
                   const isCompleted = node.completed;

                   // Simple connectivity visualization:
                   // If selectable, highlight.
                   
                   return (
                     <button
                        key={node.id}
                        onClick={() => selectable ? onNodeSelect(node) : null}
                        disabled={!selectable && !isCurrent && !isCompleted}
                        className={`
                          relative w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300
                          ${isCurrent ? 'bg-yellow-500 border-yellow-300 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse' : ''}
                          ${selectable ? 'bg-indigo-600 border-indigo-400 hover:scale-110 hover:bg-indigo-500 cursor-pointer shadow-lg animate-bounce' : ''}
                          ${isCompleted ? 'bg-gray-700 border-gray-600 opacity-50 grayscale' : ''}
                          ${!selectable && !isCurrent && !isCompleted ? 'bg-gray-800 border-gray-700 opacity-30 cursor-not-allowed' : ''}
                        `}
                     >
                        {getNodeIcon(node.type)}
                     </button>
                   );
                 })}
              </div>
            )
         })}
      </div>
    </div>
  );
};

export default GameMap;