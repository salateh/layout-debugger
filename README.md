
# Layout Debugger 🛠️

A lightweight, standalone React-powered bookmarklet widget for real-time web layout auditing, HTML validation, and error tracking on any webpage.

---

## en English

### Features
* 📐 **Layout Overflow Detection:** Automatically finds elements extending beyond the screen width that break responsive layouts.
* 🏷️ **HTML & Accessibility Audits:** Checks for missing `lang` attributes, missing `<h1>` tags, missing `alt` attributes on images, duplicate IDs, and invalid element nesting (e.g., links inside links or buttons).
* ⚠️ **JS & Resource Monitoring:** Captures runtime script errors, unhandled promise rejections, and failed asset requests (`<img>`, `<script>`).
* 🎯 **Interactive Inspection:** Hovering over any detected error highlights the element on the page in green and smoothly scrolls it into view.
* 🖐️ **Draggable & Multilingual UI:** Freely reposition the overlay on your screen and switch between English and Russian languages instantly.

### Quick Start (Bookmarklet)

1. Open your browser's **Bookmark Manager** and create a new bookmark.
2. Name it **Layout Debugger**.
3. Paste the following snippet into the **URL / Address** field:

```javascript
javascript:(function(){var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/gh/salateh/layout-debugger@main/dist/bundle.js?v="+Date.now();document.head.appendChild(s);})();

```

4. Open any webpage and click the bookmark to launch the debugger widget. Click it again to remove it.

---

## ru Русский

### Возможности

* 📐 **Поиск вылетов верстки:** Автоматически находит элементы, вылезающие за ширину экрана и ломающие адаптивность.
* 🏷️ **Проверка HTML и доступности:** Проверяет отсутствие атрибута `lang` у `<html>`, отсутствие тега `<h1>`, пропущенные `alt` у изображений, дубликаты `id` и некорректную вложенность тегов (например, ссылки внутри кнопок).
* ⚠️ **Мониторинг JS и ресурсов:** Перехватывает ошибки скриптов, упавшие промисы и не закрузившиеся ресурсы (`<img>`, `<script>`).
* 🎯 **Интерактивная подсветка:** При наведении на ошибку страница автоматически скроллится к проблемному элементу и ярко подсвечивает его.
* 🖐️ **Перетаскиваемый двуязычный UI:** Панель можно свободно перемещать по экрану и переключать язык (RU/EN) в один клик.

### Быстрый старт (Букмарклет)

1. Откройте **Диспетчер закладок** вашего браузера и создайте новую закладку.
2. Назовите её **Layout Debugger**.
3. В поле **URL / Адрес** вставьте следующий код:

```javascript
javascript:(function(){var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/gh/salateh/layout-debugger@main/dist/bundle.js?v="+Date.now();document.head.appendChild(s);})();

```

4. Откройте любой сайт и нажмите на закладку, чтобы вызвать отладчик. Повторный клик закрывает панель.

---

## 🛠️ Local Development / Локальная разработка

```bash
# Clone the repository / Клонирование репозитория
git clone [https://github.com/salateh/layout-debugger.git](https://github.com/salateh/layout-debugger.git)
cd layout-debugger

# Install dependencies / Установка зависимостей
npm install

# Run dev server / Запуск dev-сервера
npm run dev

# Build production bundle / Сборка бандла
npm run build

```


