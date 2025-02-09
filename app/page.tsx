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
import "reactflow/dist/style.css";

// Material UI components
import { Container, Box, TextField, Button, Paper } from "@mui/material";
// Import Grid2 (the new Grid component)
import Grid from "@mui/material/Grid";

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
    <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
      <Grid container spacing={2} sx={{ height: "100%" }} component="div">
        {/* Left Column: Sidebar */}
        <Grid xs={12} sm={3} md={2} component="div">
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", boxSizing: "border-box" }}
          >
            <Sidebar />
          </Paper>
        </Grid>

        {/* Right Column: Top Bar and Flow Canvas */}
        <Grid
          xs={12}
          sm={9}
          md={10}
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          component="div"
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
            component="div"
          >
            {/* Top Bar: Query Textarea and Generate Flow Button */}
            <TextField
              label="Describe your desired call flow"
              placeholder="Type your call flow description here..."
              multiline
              minRows={3}
              variant="outlined"
              fullWidth
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateFlow}
              disabled={isGenerating}
              sx={{ maxWidth: "200px" }}
            >
              {isGenerating ? "Generating..." : "Generate Flow"}
            </Button>
          </Paper>

          {/* Main Canvas */}
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              position: "relative",
              border: "1px solid #ccc",
              borderRadius: 1,
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            component="div"
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
          </Paper>
        </Grid>
      </Grid>
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
    </Container>
  );
}
