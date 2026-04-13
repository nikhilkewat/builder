"use client";

import "@xyflow/react/dist/style.css";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  type OnSelectionChangeParams,
  ReactFlow,
} from "@xyflow/react";
import { useEvaluatorBuilderStore } from "./store";
import { useCallback } from "react";
import { shallow } from "zustand/shallow";

export function MetricsFlowCanvas() {
  const nodes = useEvaluatorBuilderStore((s) => s.nodes);
  const edges = useEvaluatorBuilderStore((s) => s.edges);
  const setGraph = useEvaluatorBuilderStore((s) => s.setGraph);
  const selectedNodeId = useEvaluatorBuilderStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useEvaluatorBuilderStore((s) => s.setSelectedNodeId);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasPersistentChange = changes.some(
        (change) =>
          change.type === "add" ||
          change.type === "remove" ||
          change.type === "replace" ||
          change.type === "position",
      );
  
      if (hasPersistentChange) {
        const nextNodes = applyNodeChanges(changes, nodes);
        setGraph({ nodes: nextNodes, edges });
      }
  
    
    },
    [nodes, edges, setGraph, setSelectedNodeId]
  );


  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const hasPersistentChange = changes.some(
        (change) =>
          change.type === "add" ||
          change.type === "remove" ||
          change.type === "replace",
      );
  
      if (hasPersistentChange) {
        const nextEdges = applyEdgeChanges(changes, edges);
        setGraph({ nodes, edges: nextEdges });
      }
    },
    [nodes, edges, setGraph]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const nextEdges = addEdge(
        {
          ...connection,
          id: `edge-${connection.source}-${connection.target}-${edges.length + 1}`,
        },
        edges
      );
  
      setGraph({ nodes, edges: nextEdges });
    },
    [nodes, edges, setGraph]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selected }: OnSelectionChangeParams) => {
      const newSelectedId = selected[0]?.id ?? null;
      setSelectedNodeId(newSelectedId);
     /*  setSelectedNodeId((prev: string | null) => {
        if (prev === newSelectedId) return prev;
        console.log("selected", selected);
        return newSelectedId;
      }); */
    },
    []
  );

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onSelectionChange={handleSelectionChange}
        onlyRenderVisibleElements
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}

