# layout-debugger




A lightweight, zero-dependency browser booklet (bookmarklet) designed for web developers and QA engineers. It helps detect hidden frontend errors, runtime exceptions, structural HTML flaws, and responsiveness bugs directly on any live webpage—without needing to keep browser DevTools open.

## 🚀 Key Features

* **JS & Resource Error Tracking**: Catches uncaught runtime exceptions, unhandled Promise rejections, and broken asset links (404 errors for images or scripts).
* **HTML Structure Audit**: Identifies duplicate element `id`s and missing `alt` attributes on images.
* **Layout & Responsiveness Check**: Scans the page for elements that break out of the viewport width (causing horizontal scrolling) and highlights them with distinct borders.
* **Interactive UI**: Aggregates all found issues inside a clean, modern dark-mode dashboard panel in the corner of your screen. 
* **Toggle Mode**: Click the bookmark once to run the audit; click it again to completely remove the dashboard and clean up all highlighted borders.

---

## 💻 Installation

###  Add to Bookmarks Bar (Quickest)
1. Ensure your browser's **Bookmarks Bar** is visible (`Ctrl + Shift + B` or `Cmd + Shift + B`).
2. Right-click on your bookmarks bar and select **Add Page** (or *Add Bookmark*).
3. Set the **Name** to: `🛠️ Debugger`.
4. In the **URL / Address** field, copy and paste the entire single-line code block below:

```javascript
javascript:(function(){var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/gh/salateh/layout-debugger@main/dist/bundle.js?v="+Date.now();document.head.appendChild(s);})();
```
---

## 🛠️ How to Use

1. Navigate to any standard website you wish to test.
2. Click the `🛠️ Debugger` bookmark on your bookmarks bar.
3. The interactive dashboard will appear in the bottom-right corner, displaying real-time analytics while visual layout errors are highlighted with outlines on the page.
4. To close the panel and restore the original look of the site, simply **click the bookmark again** or click the `✕` close button on the dashboard.

*Note: Browsers block bookmarklets on internal URLs (like `chrome://...`) and sites with strict Content Security Policies (CSP), such as `github.com`. Test the debugger on typical public websites.*
