import React, { useState, useEffect, useRef, useCallback } from 'react';

// Типизация
interface DebugError {
  id: string;
  type: 'js' | 'html' | 'layout';
  text: string;
  el: HTMLElement | null;
}

export const LayoutDebugger: React.FC = () => {
  const [errors, setErrors] = useState<DebugError[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  
  // Состояние для Drag-and-Drop
  const [position, setPosition] = useState({ x: window.innerWidth - 470, y: window.innerHeight - 500 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Анализатор страницы
  const analyzePage = useCallback(() => {
    const newErrors: DebugError[] = [];
    const docWidth = document.documentElement.offsetWidth;
    const elements = document.querySelectorAll('*');

    elements.forEach((el, index) => {
      // Пример проверки вылета верстки
      if (el.offsetWidth > docWidth && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName)) {
        newErrors.push({
          id: `layout-${index}`,
          type: 'layout',
          text: `Вылет верстки: <${el.tagName.toLowerCase()}> шире экрана`,
          el: el as HTMLElement
        });
      }
      
      // Пример проверки alt
      if (el.tagName === 'IMG' && !el.hasAttribute('alt')) {
        newErrors.push({
          id: `html-img-${index}`,
          type: 'html',
          text: `Изображение без атрибута alt`,
          el: el as HTMLElement
        });
      }
    });

    setErrors(prev => [...prev, ...newErrors]);
  }, []);

  // Хук для перехвата глобальных событий (Решает твою проблему с утечками памяти)
  useEffect(() => {
    const handleGlobalError = (e: ErrorEvent) => {
      setErrors(prev => [...prev, {
        id: `js-${Date.now()}`,
        type: 'js',
        text: `[Ошибка] ${e.message}`,
        el: null
      }]);
    };

    window.addEventListener('error', handleGlobalError);
    analyzePage();

    // Очистка при размонтировании компонента!
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [analyzePage]);

  // Обработчики Drag-and-Drop
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      // Идеальная отписка от событий при закрытии
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, handleMouseMove, handleMouseUp]);

  // Обработчики наведения
  const handleMouseEnter = (el: HTMLElement | null) => {
    if (el) {
      el.style.outline = '4px solid #34c759';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleMouseLeave = (el: HTMLElement | null) => {
    if (el) el.style.outline = '';
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{ left: position.x, top: position.y }}
      className="fixed w-[450px] max-h-[80vh] bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700 flex flex-col z-[999999]"
    >
      <div 
        onMouseDown={handleMouseDown}
        className="bg-zinc-800 p-3 flex justify-between items-center border-b border-zinc-700 cursor-grab active:cursor-grabbing select-none"
      >
        <h3 className="font-bold text-sm m-0">🛠️ Валидатор и Отладчик</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <h4 className="text-xs uppercase font-semibold text-red-500 mb-2 border-b border-zinc-800 pb-1">Ошибки</h4>
        <ul className="m-0 p-0 list-none space-y-2">
          {errors.map(err => (
            <li 
              key={err.id}
              onMouseEnter={() => handleMouseEnter(err.el)}
              onMouseLeave={() => handleMouseLeave(err.el)}
              className="bg-zinc-800 p-2 rounded-md text-sm cursor-crosshair hover:bg-zinc-700 transition-colors"
            >
              {err.text}
            </li>
          ))}
          {errors.length === 0 && <li className="text-zinc-500 italic text-sm">Ошибок не обнаружено</li>}
        </ul>
      </div>
    </div>
  );
};
