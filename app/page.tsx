// app/page.tsx
"use client";

import React, { useState, DragEvent } from "react";
import dynamic from "next/dynamic";
import {
  ReactFlowProvider,
  addEdge,
  Connection,
  Edge,
  useNodesState,
  useEdgesState,
  Node,
} from "reactflow";
import Sidebar from "./components/Sidebar";
import NodeConfigPanel from "./components/NodeConfigPanel";
import styles from "./page.module.css";
import "reactflow/dist/style.css";

// Dynamically import ReactFlow (disable SSR)
const ReactFlow = dynamic(
  () => import("reactflow").then((mod) => mod.ReactFlow),
  { ssr: false }
);

export default function Home() {
  // Manage nodes and edges separately
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [query, setQuery] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const onConnect = (params: Connection | Edge) =>
    setEdges((eds) => addEdge({ ...params, animated: true }, eds));

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.data && node.data.verb) {
      setSelectedNode(node);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const newNode: Node = {
      id: String(new Date().getTime()),
      position,
      data: { label: type.toUpperCase(), verb: type, params: {} },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // When the user submits a query, call the API to generate a flow
  const handleGenerateFlow = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      // Update the canvas with the returned flow
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      console.error("Error generating flow:", error);
    }
    setIsGenerating(false);
  };

  return (
    <div className={styles.dndflow}>
      {/* Left Column: Sidebar */}
      <div className={styles.leftColumn}>
        <Sidebar />
      </div>

      {/* Right Column: Top Bar and Flow Canvas */}
      <div className={styles.rightColumn}>
        {/* Top Bar with query input */}
        <div className={styles.topBar}>
          <input
            type="text"
            placeholder="Describe your desired call flow..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "60%", padding: "8px", marginRight: "8px" }}
          />
          <button onClick={handleGenerateFlow} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Flow"}
          </button>
        </div>

        {/* Main Canvas */}
        <div
          className={styles.reactflowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onLoad={(reactFlowInstance) =>
              console.log("Flow loaded:", reactFlowInstance)
            }
          />
        </div>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onSave={(updatedData: any) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, ...updatedData } }
                    : node
                )
              );
              setSelectedNode(null);
            }}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
