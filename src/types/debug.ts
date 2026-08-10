export type Language = "ru" | "en";
export type ErrorType = "js" | "html" | "layout";

export interface DebugError {
  id: string;
  type: ErrorType;
  text: string;
  el: HTMLElement | null;
}
