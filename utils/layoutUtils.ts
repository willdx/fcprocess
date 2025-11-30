import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  
  // Adjusted settings for a more spacious and aesthetic layout
  dagreGraph.setGraph({ 
    rankdir: direction,
    // Increase separation between nodes in the same rank (vertical in LR)
    nodesep: 80, 
    // Increase separation between ranks (horizontal in LR) to prevent edge crowding
    ranksep: 250 
  });

  nodes.forEach((node) => {
    // Pass dimensions closer to the actual CustomNode size (w-[220px])
    // Height is variable but 100 is a safe average for calculation
    dagreGraph.setNode(node.id, { width: 240, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Shift slightly to center based on the dimensions used above
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 120, // half of width set above
        y: nodeWithPosition.y - 60,  // half of height set above
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};