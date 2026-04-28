import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeGrabber } from './NodeGrabber';
import { cn } from '../../lib/utils';

export function TextNode({ data, id, selected }: NodeProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-md border flex flex-col font-sans relative group transition-all duration-300 w-[480px]",
      selected ? "border-purple-500 ring-4 ring-purple-500/10" : "border-neutral-200"
    )}>
      <NodeGrabber nodeId={id} onSelectConnected={data.onSelectConnected as any} selected={selected} />
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <div className="p-2 border-b border-neutral-100 bg-neutral-50 rounded-t-xl text-xs font-medium text-neutral-600 text-center drag-handle cursor-move">
        {(data.title as string) || '文本段落'}
      </div>
      <div className="p-3">
        <textarea
          className="w-full min-h-[120px] max-h-[400px] border border-neutral-200 rounded-md p-2 text-xs focus:border-purple-500 outline-none text-neutral-800"
          value={data.content as string}
          onChange={(e) => data.onChange && (data.onChange as any)(id, { content: e.target.value })}
        />
      </div>
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}
