import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps, useReactFlow } from '@xyflow/react';

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#94a3b8', // Slate-400
        }} 
      />
      {/* Invisible thicker interaction path for easier double-clicking */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction cursor-pointer"
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (data?.onDelete) {
             (data.onDelete as any)(id);
          } else {
             deleteElements({ edges: [{ id }] });
          }
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'auto',
            zIndex: 100,
          }}
          className="nodrag nopan"
        >
          <button
            className="w-7 h-7 bg-white hover:bg-red-500 text-neutral-400 hover:text-white rounded-full flex items-center justify-center cursor-pointer border border-neutral-200 shadow-md transition-all hover:scale-110 relative z-[100]"
            style={{ fontSize: '18px', lineHeight: '1', pointerEvents: 'auto' }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (data?.onDelete) {
                 (data.onDelete as any)(id);
              } else {
                 deleteElements({ edges: [{ id }] });
              }
            }}
          >
            <span className="pointer-events-none mb-[2px]">×</span>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
