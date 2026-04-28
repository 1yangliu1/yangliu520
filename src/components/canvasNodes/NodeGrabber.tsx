import React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NodeGrabberProps {
  nodeId: string;
  onSelectConnected?: (nodeId: string) => void;
  selected?: boolean;
}

export function NodeGrabber({ nodeId, onSelectConnected, selected }: NodeGrabberProps) {
  return (
    <div 
      className={cn(
        "absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-8 border rounded-t-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing node-grabber-handle z-[60] hover:-top-11 group/grabber",
        selected 
          ? "bg-purple-600 border-purple-500 hover:bg-purple-700" 
          : "bg-white border-neutral-200 hover:bg-purple-50 hover:border-purple-300"
      )}
      onMouseDown={(e) => {
        // We don't stopPropagation to allow React Flow to start the drag
        // But we want to select connected nodes IMMEDIATELY
        onSelectConnected?.(nodeId);
      }}
    >
      <div className="flex flex-col items-center gap-[2px]">
        <GripVertical 
          size={14} 
          className={cn(
            "transition-colors",
            selected ? "text-white" : "text-neutral-400 group-hover/grabber:text-purple-500"
          )} 
        />
        <div 
          className={cn(
            "text-[9px] font-black uppercase tracking-tighter leading-none select-none",
            selected ? "text-purple-100" : "text-neutral-400 group-hover/grabber:text-purple-600"
          )}
        >
          GROUP
        </div>
      </div>
    </div>
  );
}
