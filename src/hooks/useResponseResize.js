import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function useResponseResize() {
  const store = useAppStore();
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, h: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      e.preventDefault();
      const delta = dragStart.y - e.clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight - 150, dragStart.h + delta));
      store.setResponsePaneHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isResizing, dragStart, store]);

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setDragStart({ y: e.clientY, h: store.responsePaneHeight });
  };

  return { startResize, isResizing };
}