import React from "react";
import type { DebugError } from "../types/debug";

interface ErrorSectionProps {
  title: string;
  titleColor: string;
  items: DebugError[];
  emptyText: string;
  onMouseEnter: (el: HTMLElement | null) => void;
  onMouseLeave: (el: HTMLElement | null) => void;
  onItemClick: (e: React.MouseEvent, el: HTMLElement | null) => void;
}

export const ErrorSection: React.FC<ErrorSectionProps> = ({
  title,
  titleColor,
  items,
  emptyText,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
}) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        fontWeight: 600,
        textTransform: "uppercase",
        fontSize: "11px",
        letterSpacing: "0.5px",
        marginBottom: "8px",
        paddingBottom: "4px",
        borderBottom: "1px solid #2c2c2e",
        color: titleColor,
      }}
    >
      {title}
    </div>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.length === 0 ? (
        <li
          style={{
            backgroundColor: "#2c2c2e",
            padding: "8px 12px",
            borderRadius: "6px",
            color: "#8e8e93",
            fontStyle: "italic",
          }}
        >
          {emptyText}
        </li>
      ) : (
        items.map((item) => (
          <li
            key={item.id}
            onMouseEnter={() => onMouseEnter(item.el)}
            onMouseLeave={() => onMouseLeave(item.el)}
            onClick={(e) => onItemClick(e, item.el)}
            style={{
              backgroundColor: "#2c2c2e",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "6px",
              lineHeight: "1.4",
              wordBreak: "break-word",
              cursor: item.el ? "crosshair" : "default",
              transition: "background 0.2s",
            }}
          >
            {item.text}
          </li>
        ))
      )}
    </ul>
  </div>
);
