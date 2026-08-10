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
javascript:(function(){const%20e=document.getElementById("debug-dashboard");if(e){e.remove();const%20t=document.getElementById("debug-style-node");if(t)t.remove();document.querySelectorAll(".debug-err-layout,.debug-err-broken-img,.debug-err-missing-attr").forEach((e=>e.classList.remove("debug-err-layout","debug-err-broken-img","debug-err-missing-attr")));return}const%20t=document.createElement("style");t.id="debug-style-node";t.textContent=".debug-err-layout{outline:3px%20solid%20#ff3b30!important;background:rgba(255,59,48,.1)!important}.debug-err-broken-img{outline:3px%20dashed%20#ff9500!important;filter:grayscale(1)%20contrast(.5)}.debug-err-missing-attr{outline:2px%20dashed%20#9f7aea!important}#debug-dashboard{position:fixed!important;bottom:20px!important;right:20px!important;width:450px!important;max-height:80vh!important;background:#1c1c1e!important;color:#fff!important;box-shadow:0%2012px%2030px%20rgba(0,0,0,.5)!important;border-radius:12px!important;border:1px%20solid%20#3a3a3c!important;font-family:-apple-system,BlinkMacSystemFont,'Segoe%20UI',Roboto,sans-serif!important;font-size:13px!important;z-index:999999!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}#debug-dashboard%20*{box-sizing:border-box!important}.debug-header{background:#2c2c2e!important;padding:12px%2016px!important;display:flex!important;justify-content:space-between!important;align-items:center!important;border-bottom:1px%20solid%20#3a3a3c!important}.debug-title{font-weight:700!important;font-size:14px!important;margin:0!important;color:#fff!important}.debug-close{background:none!important;border:none!important;color:#aeaeae!important;cursor:pointer!important;font-size:16px!important}.debug-close:hover{color:#fff!important}.debug-content{padding:16px!important;overflow-y:auto!important;flex:1!important}.debug-section{margin-bottom:16px!important}.debug-section-title{font-weight:600!important;text-transform:uppercase!important;font-size:11px!important;letter-spacing:.5px!important;margin-bottom:8px!important;padding-bottom:4px!important;border-bottom:1px%20solid%20#2c2c2e!important}.title-js{color:#ff3b30!important}.title-html{color:#ff9500!important}.title-layout{color:#af52de!important}.debug-list{list-style:none!important;padding:0!important;margin:0!important}.debug-item{background:#2c2c2e!important;padding:8px%2012px!important;border-radius:6px!important;margin-bottom:6px!important;line-height:1.4!important;word-break:break-word!important}.debug-item-empty{color:#8e8e93!important;font-style:italic!important}";document.head.appendChild(t);const%20s=[],a=[],d=[];window.addEventListener("error",(function(e){s.push(`[Ошибка]%20${e.message}%20(Файл:%20${e.filename}:${e.lineno})`),n()}),!0);window.addEventListener("unhandledrejection",(function(e){s.push(`[Промис]%20Отклонено%20без%20catch:%20${e.reason}`),n()}));window.addEventListener("error",(function(e){if(e.target&&("IMG"===e.target.tagName||"SCRIPT"===e.target.tagName)){const%20t=e.target.src||e.target.href;a.push(`Не%20удалось%20загрузить%20ресурс%20(${e.target.tagName}):%20${t}`),"IMG"===e.target.tagName&&e.target.classList.add("debug-err-broken-img"),n()}}),!0);const%20o=document.documentElement.offsetWidth;document.querySelectorAll("*").forEach((e=>{e.offsetWidth>o&&(e.classList.add("debug-err-layout"),d.push(`Вылет%20верстки:%20Элемент%20&lt;${e.tagName.toLowerCase()}&gt;%20${e.className?"."+e.className.split(" ").join("."):""}%20шире%20экрана%20(${e.offsetWidth}px%20&gt;%20${o}px)`)),"IMG"!==e.tagName||e.hasAttribute("alt")&&""!==e.getAttribute("alt").trim()||(e.classList.add("debug-err-missing-attr"),a.push(`Изображение%20без%20атрибута%20alt:%20${e.src.substring(0,50)}...`)),e.id&&(document.querySelectorAll(`[id="${e.id}"]`).length>1&&!a.some((t=>t.includes(`Дубликат%20ID:%20${e.id}`))))&&a.push(`Дубликат%20ID%20на%20странице:%20Повторяется%20id="${e.id}"`)}));const%20i=document.createElement("div");i.id="debug-dashboard";i.innerHTML='<div%20class="debug-header"><h3%20class="debug-title">🛠️%20Валидатор%20и%20Отладчик</h3><button%20class="debug-close"%20onclick="document.getElementById(\'debug-dashboard\').remove();document.getElementById(\'debug-style-node\').remove();">✕</button></div><div%20class="debug-content"><div%20class="debug-section"><div%20class="debug-section-title%20title-js">Ошибки%20JS%20и%20Ресурсов</div><ul%20class="debug-list"%20id="debug-js-list"></ul></div><div%20class="debug-section"><div%20class="debug-section-title%20title-html">Проблемы%20HTML%20структуры</div><ul%20class="debug-list"%20id="debug-html-list"></ul></div><div%20class="debug-section"><div%20class="debug-section-title%20title-layout">Ошибки%20Верстки%20(Сломанный%20адатив)</div><ul%20class="debug-list"%20id="debug-layout-list"></ul></div></div>';document.body.appendChild(i);function%20n(){const%20e=(e,t)=>{const%20c=document.getElementById(e);c&&(0===t.length?c.innerHTML='<li%20class="debug-item%20debug-item-empty">Ошибок%20не%20обнаружено</li>':c.innerHTML=t.map((e=>`<li%20class="debug-item">${e}</li>`)).join(""))};e("debug-js-list",s);e("debug-html-list",a);e("debug-layout-list",d)}n()})();
```
---

## 🛠️ How to Use

1. Navigate to any standard website you wish to test.
2. Click the `🛠️ Debugger` bookmark on your bookmarks bar.
3. The interactive dashboard will appear in the bottom-right corner, displaying real-time analytics while visual layout errors are highlighted with outlines on the page.
4. To close the panel and restore the original look of the site, simply **click the bookmark again** or click the `✕` close button on the dashboard.

*Note: Browsers block bookmarklets on internal URLs (like `chrome://...`) and sites with strict Content Security Policies (CSP), such as `github.com`. Test the debugger on typical public websites.*
