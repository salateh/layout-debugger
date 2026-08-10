(function() {
  const existingDash = document.getElementById('debug-dashboard');
  const existingCSS = document.getElementById('debug-style-node');
  
  if (existingDash) {
    existingDash.remove();
    if (existingCSS) existingCSS.remove();
    document.querySelectorAll('.debug-err-layout, .debug-err-broken-img, .debug-err-missing-attr').forEach(el => {
      el.classList.remove('debug-err-layout', 'debug-err-broken-img', 'debug-err-missing-attr');
    });
    return;
  }

  const jsErrors = [];
  const htmlErrors = [];
  const layoutErrors = [];

  window.addEventListener('error', function(e) {
    jsErrors.push(`[Ошибка] ${e.message} (Файл: ${e.filename}:${e.lineno})`);
    updateDashboard();
  }, true);

  window.addEventListener('unhandledrejection', function(e) {
    jsErrors.push(`[Промис] Отклонено без catch: ${e.reason}`);
    updateDashboard();
  });

  window.addEventListener('error', function(e) {
    if (e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT')) {
      const url = e.target.src || e.target.href;
      htmlErrors.push(`Не удалось загрузить ресурс (${e.target.tagName}): ${url}`);
      if (e.target.tagName === 'IMG') e.target.classList.add('debug-err-broken-img');
      updateDashboard();
    }
  }, true);

  function analyzePage() {
    const docWidth = document.documentElement.offsetWidth;
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      if (el.offsetWidth > docWidth) {
        el.classList.add('debug-err-layout');
        layoutErrors.push(`Вылет верстки: Элемент &lt;${el.tagName.toLowerCase()}&gt; ${el.className ? '.' + el.className.split(' ').join('.') : ''} шире экрана (${el.offsetWidth}px &gt; ${docWidth}px)`);
      }
      
      if (el.tagName === 'IMG' && (!el.hasAttribute('alt') || el.getAttribute('alt').trim() === '')) {
        el.classList.add('debug-err-missing-attr');
        htmlErrors.push(`Изображение без атрибута alt: ${el.src.substring(0, 50)}...`);
      }

      if (el.id) {
        const dupes = document.querySelectorAll(`[id="${el.id}"]`);
        if (dupes.length > 1 && !htmlErrors.some(m => m.includes(`Дубликат ID: ${el.id}`))) {
          htmlErrors.push(`Дубликат ID на странице: Повторяется id="${el.id}" (${dupes.length} раз)`);
        }
      }
    });
  }

  function createDashboard() {
    const link = document.createElement('link');
    link.id = 'debug-style-node';
    link.rel = 'stylesheet';
    link.href = 'https://YOUR_USERNAME.github.io/layout-debugger/my-debug.css?t=' + Date.now();
    document.head.appendChild(link);

    const dash = document.createElement('div');
    dash.id = 'debug-dashboard';
    dash.innerHTML = `
      <div class="debug-header">
        <h3 class="debug-title">🛠️ Валидатор и Отладчик</h3>
        <button class="debug-close" onclick="this.parentElement.parentElement.remove(); document.getElementById('debug-style-node').remove();">✕</button>
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
  }

  function updateDashboard() {
    const renderList = (elementId, array) => {
      const listEl = document.getElementById(elementId);
      if (!listEl) return;
      if (array.length === 0) {
        listEl.innerHTML = '<li class="debug-item debug-item-empty">Ошибок не обнаружено</li>';
      } else {
        listEl.innerHTML = array.map(err => `<li class="debug-item">${err}</li>`).join('');
      }
    };

    renderList('debug-js-list', jsErrors);
    renderList('debug-html-list', htmlErrors);
    renderList('debug-layout-list', layoutErrors);
  }

  createDashboard();
  analyzePage();
  updateDashboard();
})();
