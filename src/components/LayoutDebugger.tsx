import React, { useState, useEffect, useRef, useCallback } from "react";
import { TRANSLATIONS } from "../constants/translations";
import { analyzePage } from "../utils/analyzer";
import { ErrorSection } from "./ErrorSection";
import type { DebugError, Language } from "../types/debug";

export const LayoutDebugger: React.FC = () => {
  const [lang, setLang] = useState<Language>("ru");
  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState<DebugError[]>([]);
  const [isHoveredError, setIsHoveredError] = useState(false);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const highlightedElRef = useRef<HTMLElement | null>(null);
  const pinnedElRef = useRef<HTMLElement | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const styleId = "debug-react-style-node";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .debug-highlight-active {
          outline: 4px solid #34c759 !important;
          box-shadow: 0 0 20px rgba(52, 199, 89, 0.9) !important;
          background-color: rgba(52, 199, 89, 0.25) !important;
          z-index: 2147483646 !important;
          transition: all 0.15s ease-in-out !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => {
      if (pinnedElRef.current) {
        pinnedElRef.current.classList.remove("debug-highlight-active");
        pinnedElRef.current = null;
      }
      if (highlightedElRef.current) {
        highlightedElRef.current.classList.remove("debug-highlight-active");
        highlightedElRef.current = null;
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const runAnalysis = useCallback(() => {
    const foundErrors = analyzePage(t);
    setErrors(foundErrors);
  }, [t]);

  useEffect(() => {
    const handleWindowError = (e: ErrorEvent) => {
      if (
        e.target &&
        ((e.target as HTMLElement).tagName === "IMG" ||
          (e.target as HTMLElement).tagName === "SCRIPT")
      ) {
        const target = e.target as HTMLElement;
        const url = (target as HTMLImageElement).src || (target as HTMLLinkElement).href || "";
        setErrors((prev) => [
          ...prev,
          {
            id: `res-err-${Date.now()}-${Math.random()}`,
            type: "html",
            text: t.failedResource.replace("{tag}", target.tagName).replace("{url}", url),
            el: target,
          },
        ]);
      } else {
        setErrors((prev) => [
          ...prev,
          {
            id: `js-err-${Date.now()}-${Math.random()}`,
            type: "js",
            text: t.jsError.replace("{message}", e.message || "Script error"),
            el: null,
          },
        ]);
      }
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      setErrors((prev) => [
        ...prev,
        {
          id: `promise-err-${Date.now()}-${Math.random()}`,
          type: "js",
          text: t.promiseError.replace("{reason}", String(e.reason)),
          el: null,
        },
      ]);
    };

    window.addEventListener("error", handleWindowError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    runAnalysis();

    return () => {
      window.removeEventListener("error", handleWindowError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [runAnalysis, t]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;

    isDragging.current = true;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setPosition({
        x: dragRef.current.initialX + dx,
        y: dragRef.current.initialY + dy,
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseEnter = (el: HTMLElement | null) => {
    setIsHoveredError(true);
    if (!el) return;

    if (pinnedElRef.current && pinnedElRef.current !== el) {
      pinnedElRef.current.classList.remove("debug-highlight-active");
      pinnedElRef.current = null;
    }

    if (highlightedElRef.current && highlightedElRef.current !== el) {
      highlightedElRef.current.classList.remove("debug-highlight-active");
    }

    highlightedElRef.current = el;
    el.classList.add("debug-highlight-active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleMouseLeave = (el: HTMLElement | null) => {
    setIsHoveredError(false);
    if (!el) return;

    if (pinnedElRef.current === el) return;

    el.classList.remove("debug-highlight-active");
    if (highlightedElRef.current === el) {
      highlightedElRef.current = null;
    }
  };

  const handleErrorClick = (e: React.MouseEvent, el: HTMLElement | null) => {
    e.stopPropagation();
    if (!el) return;

    pinnedElRef.current = el;
    highlightedElRef.current = el;
    el.classList.add("debug-highlight-active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleClose = () => {
    if (pinnedElRef.current) {
      pinnedElRef.current.classList.remove("debug-highlight-active");
      pinnedElRef.current = null;
    }
    if (highlightedElRef.current) {
      highlightedElRef.current.classList.remove("debug-highlight-active");
      highlightedElRef.current = null;
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const jsErrors = errors.filter((e) => e.type === "js");
  const htmlErrors = errors.filter((e) => e.type === "html");
  const layoutErrors = errors.filter((e) => e.type === "layout");

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "450px",
        maxHeight: "80vh",
        backgroundColor: "#1c1c1e",
        color: "#ffffff",
        boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        borderRadius: "12px",
        border: "1px solid #3a3a3c",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "13px",
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: isHoveredError ? 0.3 : 1,
        transition: "opacity 0.2s ease-in-out",
      }}
      className="debug-dashboard-container select-none"
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          backgroundColor: "#2c2c2e",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #3a3a3c",
          cursor: "grab",
        }}
        className="active:cursor-grabbing"
      >
        <h3 style={{ fontWeight: "bold", fontSize: "14px", margin: 0, color: "#fff", pointerEvents: "none" }}>
          {t.title}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setLang((prev) => (prev === "ru" ? "en" : "ru"))}
            style={{
              background: "#3a3a3c",
              border: "none",
              color: "#34c759",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            title="Switch Language"
          >
            {lang.toUpperCase()}
          </button>

          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", color: "#aeaeae", cursor: "pointer", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
        <ErrorSection
          title={t.jsSection}
          titleColor="#ff3b30"
          items={jsErrors}
          emptyText={t.empty}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onItemClick={handleErrorClick}
        />

        <ErrorSection
          title={t.htmlSection}
          titleColor="#ff9500"
          items={htmlErrors}
          emptyText={t.empty}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onItemClick={handleErrorClick}
        />

        <ErrorSection
          title={t.layoutSection}
          titleColor="#af52de"
          items={layoutErrors}
          emptyText={t.empty}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onItemClick={handleErrorClick}
        />
      </div>
    </div>
  );
};