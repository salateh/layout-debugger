import React, { useState, useEffect, useRef, useCallback } from "react";

type Language = "ru" | "en";

interface DebugError {
  id: string;
  type: "js" | "html" | "layout";
  text: string;
  el: HTMLElement | null;
}

const TRANSLATIONS = {
  ru: {
    title: "🛠️ Валидатор и Отладчик",
    jsSection: "Ошибки JS и Ресурсов",
    htmlSection: "Проблемы HTML структуры",
    layoutSection: "Ошибки Верстки (Сломанный адаптив)",
    empty: "Ошибок не обнаружено",
    noLang:
      "Пропущен атрибут lang: У тега <html> обязательно должен быть указан язык.",
    noH1: "Отсутствует тег <h1> на странице. Это критично для SEO и доступности.",
    layoutOverflow:
      "Вылет верстки: <{tag}> шире экрана ({width}px > {docWidth}px)",
    missingAlt: "Изображение без атрибута alt: {src}",
    duplicateId: 'Дублирование id: Значение "{id}" должно быть уникальным.',
    invalidNesting:
      "Неправильная вложенность: <{child}> находится внутри <{parent}>",
    failedResource: "Не загружен ресурс ({tag}): {url}",
    jsError: "[Ошибка] {message}",
    promiseError: "[Промис] Отклонено без catch: {reason}",
  },
  en: {
    title: "🛠️ Validator & Debugger",
    jsSection: "JS & Resource Errors",
    htmlSection: "HTML Structure Issues",
    layoutSection: "Layout Errors (Broken Responsive)",
    empty: "No errors detected",
    noLang: "Missing lang attribute: The <html> tag must specify a language.",
    noH1: "Missing <h1> tag on page. Critical for SEO and accessibility.",
    layoutOverflow:
      "Layout overflow: <{tag}> is wider than screen ({width}px > {docWidth}px)",
    missingAlt: "Image missing alt attribute: {src}",
    duplicateId: 'Duplicate ID: Value "{id}" must be unique on page.',
    invalidNesting: "Invalid nesting: <{child}> inside <{parent}>",
    failedResource: "Failed to load resource ({tag}): {url}",
    jsError: "[Error] {message}",
    promiseError: "[Promise] Unhandled rejection: {reason}",
  },
};

export const LayoutDebugger: React.FC = () => {
  const [lang, setLang] = useState<Language>("ru");
  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState<DebugError[]>([]);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const highlightedElRef = useRef<HTMLElement | null>(null);

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

  const analyzePage = useCallback(() => {
    const newErrors: DebugError[] = [];
    const docWidth = document.documentElement.offsetWidth;
    const elements = document.querySelectorAll("*");
    const seenIds = new Set<string>();
    const duplicateIds = new Set<string>();

    if (
      !document.documentElement.hasAttribute("lang") ||
      !document.documentElement.getAttribute("lang")?.trim()
    ) {
      newErrors.push({
        id: "html-lang",
        type: "html",
        text: t.noLang,
        el: document.documentElement,
      });
    }

    if (document.querySelectorAll("h1").length === 0) {
      newErrors.push({
        id: "html-h1",
        type: "html",
        text: t.noH1,
        el: document.body,
      });
    }

    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;

      if (
        htmlEl.offsetWidth > docWidth &&
        !["SCRIPT", "STYLE", "LINK"].includes(htmlEl.tagName)
      ) {
        newErrors.push({
          id: `layout-overflow-${index}`,
          type: "layout",
          text: t.layoutOverflow
            .replace("{tag}", htmlEl.tagName.toLowerCase())
            .replace("{width}", htmlEl.offsetWidth.toString())
            .replace("{docWidth}", docWidth.toString()),
          el: htmlEl,
        });
      }

      if (
        htmlEl.tagName === "IMG" &&
        (!htmlEl.hasAttribute("alt") || !htmlEl.getAttribute("alt")?.trim())
      ) {
        const src = (htmlEl as HTMLImageElement).src.substring(0, 35) + "...";
        newErrors.push({
          id: `html-alt-${index}`,
          type: "html",
          text: t.missingAlt.replace("{src}", src),
          el: htmlEl,
        });
      }

      if (htmlEl.id) {
        if (seenIds.has(htmlEl.id)) {
          duplicateIds.add(htmlEl.id);
        } else {
          seenIds.add(htmlEl.id);
        }
      }

      if (["A", "BUTTON"].includes(htmlEl.tagName)) {
        const parent = htmlEl.parentElement?.closest("a, button");
        if (parent) {
          newErrors.push({
            id: `html-nesting-${index}`,
            type: "html",
            text: t.invalidNesting
              .replace("{child}", htmlEl.tagName.toLowerCase())
              .replace("{parent}", parent.tagName.toLowerCase()),
            el: htmlEl,
          });
        }
      }
    });

    duplicateIds.forEach((id) => {
      document.querySelectorAll(`[id="${id}"]`).forEach((dupeEl, idx) => {
        newErrors.push({
          id: `html-dupe-id-${id}-${idx}`,
          type: "html",
          text: t.duplicateId.replace("{id}", id),
          el: dupeEl as HTMLElement,
        });
      });
    });

    setErrors(newErrors);
  }, [t]);

  useEffect(() => {
    const handleWindowError = (e: ErrorEvent) => {
      if (
        e.target &&
        ((e.target as HTMLElement).tagName === "IMG" ||
          (e.target as HTMLElement).tagName === "SCRIPT")
      ) {
        const target = e.target as HTMLElement;
        const url =
          (target as HTMLImageElement).src ||
          (target as HTMLLinkElement).href ||
          "";
        setErrors((prev) => [
          ...prev,
          {
            id: `res-err-${Date.now()}-${Math.random()}`,
            type: "html",
            text: t.failedResource
              .replace("{tag}", target.tagName)
              .replace("{url}", url),
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

    analyzePage();

    return () => {
      window.removeEventListener("error", handleWindowError, true);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, [analyzePage, t]);

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
    if (!el) return;
    if (highlightedElRef.current && highlightedElRef.current !== el) {
      highlightedElRef.current.classList.remove("debug-highlight-active");
    }
    highlightedElRef.current = el;
    el.classList.add("debug-highlight-active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleMouseLeave = (el: HTMLElement | null) => {
    if (!el) return;
    el.classList.remove("debug-highlight-active");
    if (highlightedElRef.current === el) {
      highlightedElRef.current = null;
    }
  };

  const handleClose = () => {
    if (highlightedElRef.current) {
      highlightedElRef.current.classList.remove("debug-highlight-active");
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
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: "13px",
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
        <h3
          style={{
            fontWeight: "bold",
            fontSize: "14px",
            margin: 0,
            color: "#fff",
            pointerEvents: "none",
          }}
        >
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
            style={{
              background: "none",
              border: "none",
              color: "#aeaeae",
              cursor: "pointer",
              fontSize: "16px",
            }}
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
        />

        <ErrorSection
          title={t.htmlSection}
          titleColor="#ff9500"
          items={htmlErrors}
          emptyText={t.empty}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <ErrorSection
          title={t.layoutSection}
          titleColor="#af52de"
          items={layoutErrors}
          emptyText={t.empty}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
};

interface ErrorSectionProps {
  title: string;
  titleColor: string;
  items: DebugError[];
  emptyText: string;
  onMouseEnter: (el: HTMLElement | null) => void;
  onMouseLeave: (el: HTMLElement | null) => void;
}

const ErrorSection: React.FC<ErrorSectionProps> = ({
  title,
  titleColor,
  items,
  emptyText,
  onMouseEnter,
  onMouseLeave,
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
