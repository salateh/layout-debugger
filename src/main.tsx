import { createRoot } from "react-dom/client";
import { LayoutDebugger } from "./components/LayoutDebugger";

const ROOT_ID = "layout-debugger-inject-root";

(function init() {
  const existingRoot = document.getElementById(ROOT_ID);

  // Повторный клик по буклету закрывает/удаляет панель
  if (existingRoot) {
    existingRoot.remove();
    return;
  }

  const container = document.createElement("div");
  container.id = ROOT_ID;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<LayoutDebugger />);
})();
