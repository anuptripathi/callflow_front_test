// components/Sidebar.tsx
"use client";

import React from "react";
import styles from "../styles/Sidebar.module.css";

interface Verb {
  verb: string;
  label: string;
}

const verbs: Verb[] = [
  { verb: "accept", label: "Accept" },
  { verb: "hangup", label: "Hangup" },
  { verb: "play", label: "Play Audio" },
  { verb: "playDtmf", label: "Play DTMF" },
  { verb: "say", label: "Say (TTS)" },
  { verb: "gather", label: "Gather Input" },
  { verb: "dial", label: "Dial/Bridge" },
  { verb: "record", label: "Record" },
  { verb: "mute", label: "Mute" },
  { verb: "unmute", label: "Unmute" },
];

const Sidebar: React.FC = () => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className={styles.sidebar}>
      <h3>Available Verbs</h3>
      {verbs.map((v) => (
        <div
          key={v.verb}
          className={styles.dndnode}
          draggable
          onDragStart={(event) => onDragStart(event, v.verb)}
        >
          {v.label}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
