// components/CustomNode.tsx
"use client";

import React from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #ddd",
        borderRadius: 4,
        background: "#fff",
      }}
    >
      <strong>{data.name || data.label}</strong>
      {/* If not an ACCEPT node, show input handle */}
      {data.verb !== "accept" && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ background: "#555" }}
        />
      )}
      {/* If not a HANGUP node, show output handles for success and failure */}
      {data.verb !== "hangup" && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="success"
            style={{ top: "30%", background: "green" }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="failure"
            style={{ top: "70%", background: "red" }}
          />
        </>
      )}
    </div>
  );
};

export default CustomNode;
