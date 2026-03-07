import { useState, useRef, useEffect, useCallback } from 'react';

export function useResizable(defaultHeight, minHeight, maxHeight) {
  const [height, setHeight] = useState(defaultHeight);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartH = useRef(0);

  const startDrag = useCallback((e) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartH.current = height;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [height]);

  useEffect(() => {
    const onDrag = (e) => {
      if (!isDragging) return;
      const delta = e.clientY - dragStartY.current;
      const newH = Math.max(minHeight, Math.min(maxHeight, dragStartH.current + delta));
      setHeight(newH);
    };
    
    const stopDrag = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDrag);
    }
    
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [isDragging, minHeight, maxHeight]);

  return { height, isDragging, startDrag };
}