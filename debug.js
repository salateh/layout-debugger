(function() {
  const DASHBOARD_ID = 'debug-dashboard';
  const STYLE_ID = 'debug-style-node';

  // Очистка предыдущего экземпляра
  const existingDash = document.getElementById(DASHBOARD_ID);
  const existingCSS = document.getElementById(STYLE_ID);
  
  if (existingDash) {
    existingDash.remove();
    if (existingCSS) existingCSS.remove();
    document.querySelectorAll('.debug-err-layout, .debug-err-broken-img, .debug-err-missing-attr, .debug-highlight-hover').forEach(el => {
      el.classList.remove('debug-err-layout', 'debug-err-broken-img', 'debug-err-missing-attr', 'debug-highlight-hover');
    });
    return;
  }

  // Теперь храним объекты: { text: string, el: HTMLElement | null }
  const jsErrors = [];
  const htmlErrors = [];
  const layoutErrors = [];

  // Перехват JS ошибок
  window.addEventListener('error', function(e) {
    if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT')) {
      const url = e.target.src || e.target.href;
      htmlErrors.push({ text: `Не загружен ресурс (${e.target.tagName}): ${url}`, el: e.target });
      if (e.target.tagName === 'IMG') e.target.classList.add('debug-err-broken-img');
    } else {
      jsErrors.push({ text: `[Ошибка] ${e.message} (Файл: ${e.filename}:${e.lineno})`, el: null });
    }
    updateDashboard();
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    jsErrors.push({ text: `[Промис] Отклонено без catch: ${e.reason}`, el: null });
    updateDashboard();
  });

  function analyzePage() {
    const docWidth = document.documentElement.offsetWidth;
    const elements = document.querySelectorAll('*');
    const seenIds = new Set();
    const duplicateIds = new Set();

    // Глобальные проверки страницы
    if (!document.documentElement.hasAttribute('lang') || document.documentElement.getAttribute('lang').trim() === '') {
        htmlErrors.push({ text: 'Пропущен атрибут lang: У тега <html> обязательно должен быть указан язык.', el: document.documentElement });
    }

    if (document.querySelectorAll('h1').length === 0) {
        htmlErrors.push({ text: 'Отсутствует тег <h1> на странице. Это критично для SEO и доступности.', el: document.body });
    }

    elements.forEach(el => {
      // 1. Вылет верстки (Сломанный адаптив)
      if (el.offsetWidth > docWidth && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && el.tagName !== 'LINK') {
        el.classList.add('debug-err-layout');
        layoutErrors.push({ 
            text: `Вылет верстки: <${el.tagName.toLowerCase()}> шире экрана (${el.offsetWidth}px > ${docWidth}px)`, 
            el: el 
        });
      }
      
      // 2. Отсутствие alt у изображений
      if (el.tagName === 'IMG' && (!el.hasAttribute('alt') || el.getAttribute('alt').trim() === '')) {
        el.classList.add('debug-err-missing-attr');
        htmlErrors.push({ text: `Изображение без атрибута alt: ${el.src.substring(0, 40)}...`, el: el });
      }

      // 3. Дублирование id
      if (el.id) {
        if (seenIds.has(el.id)) {
            duplicateIds.add(el.id);
        } else {
            seenIds.add(el.id);
        }
      }

      // 4. Неправильная вложенность (базовая эвристика)
      // Проверяем интерактивные элементы внутри интерактивных (типичная ошибка)
      if (['A', 'BUTTON'].includes(el.tagName)) {
         const badParent = el.parentElement?.closest('a, button');
         if (badParent) {
            htmlErrors.push({ text: `Неправильная вложенность: <${el.tagName.toLowerCase()}> находится внутри <${badParent.tagName.toLowerCase()}>`, el: el });
         }
      }
    });

    // Обрабатываем найденные дубликаты ID
    duplicateIds.forEach(id => {
        const dupes = document.querySelectorAll(`[id="${id}"]`);
        dupes.forEach(el => {
            htmlErrors.push({ text: `Дублирование id: Значение "${id}" должно быть уникальным.`, el: el });
        });
    });
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .debug-err-layout { outline: 3px solid #ff3b30 !important; background: rgba(255, 59, 48, 0.1) !important; }
      .debug-err-broken-img { outline: 3px dashed #ff9500 !important; filter: grayscale(1) contrast(0.5) !important; }
      .debug-err-missing-attr { outline: 2px dashed #9f7aea !important; }
      .debug-highlight-hover { outline: 4px solid #34c759 !important; box-shadow: 0 0 15px rgba(52,199,89, 0.8) !important; background: rgba(52,199,89, 0.2) !important; z-index: 9999999 !important; transition: all 0.2s !important; }

      #debug-dashboard {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          width: 450px !important;
          max-height: 80vh !important;
          background: #1c1c1e !important;
          color: #ffffff !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.5) !important;
          border-radius: 12px !important;
          border: 1px solid #3a3a3c !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 13px !important;
          z-index: 2147483647 !important; /* Максимальный z-index */
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
      }

      #debug-dashboard * { box-sizing: border-box !important; }

      .debug-header {
          background: #2c2c2e !important;
          padding: 12px 16px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          border-bottom: 1px solid #3a3a3c !important;
          cursor: grab !important; /* Курсор для Drag&Drop */
          user-select: none !important;
      }
      .debug-header:active { cursor: grabbing !important; }
      .debug-title { font-weight: bold !important; font-size: 14px !important; margin: 0 !important; color: #fff !important; pointer-events: none;}
      .debug-close { background: none !important; border: none !important; color: #aeaeae !important; cursor: pointer !important; font-size: 16px !important; pointer-events: auto; }
      .debug-close:hover { color: #fff !important; }

      .debug-content { padding: 16px !important; overflow-y: auto !important; flex: 1 !important; }
      .debug-section { margin-bottom: 16px !important; }
      .debug-section-title { 
          font-weight: 600 !important; text-transform: uppercase !important; 
          font-size: 11px !important; letter-spacing: 0.5px !important; 
          margin-bottom: 8px !important; padding-bottom: 4px !important;
          border-bottom: 1px solid #2c2c2e !important;
      }
      .title-js { color: #ff3b30 !important; }
      .title-html { color: #ff9500 !important; }
      .title-layout { color: #af52de !important; }

      .debug-list { list-style: none !important; padding: 0 !important; margin: 0 !important; }
      .debug-item { 
          background: #2c2c2e !important; padding: 8px 12px !important; 
          border-radius: 6px !important; margin-bottom: 6px !important; 
          line-height: 1.4 !important; word-break: break-word !important;
          cursor: crosshair !important;
          transition: background 0.2s !important;
      }
      .debug-item:hover { background: #3a3a3c !important; }
      .debug-item-empty { color: #8e8e93 !important; font-style: italic !important; cursor: default !important; }
      .debug-item-empty:hover { background: #2c2c2e !important; }
    `;
    document.head.appendChild(style);
  }

  function createDashboard() {
    injectStyles();

    const dash = document.createElement('div');
    dash.id = DASHBOARD_ID;
    dash.innerHTML = `
      <div class="debug-header" id="debug-drag-handle">
        <h3 class="debug-title">🛠️ Валидатор и Отладчик</h3>
        <button class="debug-close" id="debug-close-btn">✕</button>
      </div>
      <div class="debug-content">
        <div class="debug-section">
          <div class="debug-section-title title-js">Ошибки JS и Ресурсов</div>
          <ul class="debug-list" id="debug-js-list"></ul>
        </div>
        <div class="debug-section">
          <div class="debug-section-title title-html">Проблемы HTML структуры</div>
          <ul class="debug-list" id="debug-html-list"></ul>
        </div>
        <div class="debug-section">
          <div class="debug-section-title title-layout">Ошибки Верстки (Сломанный адаптив)</div>
          <ul class="debug-list" id="debug-layout-list"></ul>
        </div>
      </div>
    `;
    document.body.appendChild(dash);

    // Логика закрытия
    document.getElementById('debug-close-btn').addEventListener('click', () => {
      dash.remove();
      document.getElementById(STYLE_ID).remove();
      document.querySelectorAll('.debug-highlight-hover').forEach(el => el.classList.remove('debug-highlight-hover'));
    });

    initDragAndDrop(dash);
  }

  // Функция для Drag and Drop
  function initDragAndDrop(dash) {
    const handle = document.getElementById('debug-drag-handle');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.id === 'debug-close-btn') return; // Игнорируем клик по крестику
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = dash.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      
      // Сбрасываем жесткие привязки bottom/right
      dash.style.bottom = 'auto';
      dash.style.right = 'auto';
      dash.style.left = initialLeft + 'px';
      dash.style.top = initialTop + 'px';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      dash.style.left = `${initialLeft + dx}px`;
      dash.style.top = `${initialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function updateDashboard() {
    const renderList = (elementId, array) => {
      const listEl = document.getElementById(elementId);
      if (!listEl) return;
      
      listEl.innerHTML = ''; // Очищаем список перед рендером

      if (array.length === 0) {
        listEl.innerHTML = '<li class="debug-item debug-item-empty">Ошибок не обнаружено</li>';
        return;
      } 

      // Рендерим элементы списка и вешаем события для подсветки
      array.forEach(errObj => {
        const li = document.createElement('li');
        li.className = 'debug-item';
        // Экранируем HTML чтобы не сломать разметку, если в тексте ошибки попадутся теги
        li.textContent = errObj.text; 

        if (errObj.el) {
            li.addEventListener('mouseenter', () => {
                errObj.el.classList.add('debug-highlight-hover');
                errObj.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            li.addEventListener('mouseleave', () => {
                errObj.el.classList.remove('debug-highlight-hover');
            });
        }
        
        listEl.appendChild(li);
      });
    };

    renderList('debug-js-list', jsErrors);
    renderList('debug-html-list', htmlErrors);
    renderList('debug-layout-list', layoutErrors);
  }

  createDashboard();
  analyzePage();
  updateDashboard();
})();
