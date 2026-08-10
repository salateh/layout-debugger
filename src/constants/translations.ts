import type { Language } from "../types/debug";

export const TRANSLATIONS = {
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
    missingDimensions:
      'Изображение без размеров: У <img src="{src}"> не заданы width/height или aspect-ratio.',
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
    missingDimensions:
      'Image missing dimensions: <img src="{src}"> is missing width/height attributes or aspect-ratio CSS property.',
    duplicateId: 'Duplicate ID: Value "{id}" must be unique on page.',
    invalidNesting: "Invalid nesting: <{child}> inside <{parent}>",
    failedResource: "Failed to load resource ({tag}): {url}",
    jsError: "[Error] {message}",
    promiseError: "[Promise] Unhandled rejection: {reason}",
  },
} as const;

export type TranslationKeys = (typeof TRANSLATIONS)[Language];
