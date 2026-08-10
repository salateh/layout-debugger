import type { TranslationKeys } from "../constants/translations";
import type { DebugError } from "../types/debug";

export const analyzePage = (t: TranslationKeys): DebugError[] => {
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

    if (htmlEl.tagName === "IMG") {
      const imgEl = htmlEl as HTMLImageElement;
      const src = imgEl.src
        ? imgEl.src.substring(0, 35) + "..."
        : "src missing";

      if (!imgEl.hasAttribute("alt") || !imgEl.getAttribute("alt")?.trim()) {
        newErrors.push({
          id: `html-alt-${index}`,
          type: "html",
          text: t.missingAlt.replace("{src}", src),
          el: imgEl,
        });
      }

      const hasWidth =
        imgEl.hasAttribute("width") &&
        imgEl.getAttribute("width")?.trim() !== "";
      const hasHeight =
        imgEl.hasAttribute("height") &&
        imgEl.getAttribute("height")?.trim() !== "";
      const computedStyle = window.getComputedStyle(imgEl);
      const hasAspectRatio =
        computedStyle.aspectRatio !== "auto" &&
        computedStyle.aspectRatio !== "" &&
        computedStyle.aspectRatio !== "normal";

      if (!(hasWidth && hasHeight) && !hasAspectRatio) {
        newErrors.push({
          id: `html-img-dim-${index}`,
          type: "html",
          text: t.missingDimensions.replace("{src}", src),
          el: imgEl,
        });
      }
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

  return newErrors;
};
