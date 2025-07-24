import React, { useRef, useCallback, useState, useEffect } from 'react';
import { TextElement } from '../App';

interface DraggableTextProps {
  element: TextElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<TextElement>) => void;
  onSelect: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const DraggableText: React.FC<DraggableTextProps> = ({
  element,
  isSelected,
  onUpdate,
  onSelect,
  canvasRef,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isSelected) {
      onSelect();
    }
    
    if (event.target === elementRef.current || (event.target as Element).closest('.text-content')) {
      const rect = elementRef.current!.getBoundingClientRect();
      const canvasRect = canvasRef.current!.getBoundingClientRect();
      
      setIsDragging(true);
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  }, [isSelected, onSelect]);

  const handleResizeMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: element.width,
      height: element.height,
      mouseX: event.clientX,
      mouseY: event.clientY,
    });
  }, [element.width, element.height]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate new position based on mouse position and drag offset
      const newX = Math.max(0, Math.min(
        event.clientX - canvasRect.left - dragOffset.x,
        canvasRect.width - element.width
      ));
      const newY = Math.max(0, Math.min(
        event.clientY - canvasRect.top - dragOffset.y,
        canvasRect.height - element.height
      ));
      
      onUpdate({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = event.clientX - resizeStart.mouseX;
      const deltaY = event.clientY - resizeStart.mouseY;
      const newWidth = Math.max(30, resizeStart.width + deltaX);
      const newHeight = Math.max(20, resizeStart.height + deltaY);
      
      onUpdate({ width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, element.width, element.height, onUpdate, canvasRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'se-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      className={`absolute select-none group ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''
      } ${element.isNumberVariable ? 'bg-purple-50' : 'bg-white'} 
      hover:ring-1 hover:ring-blue-300 transition-all duration-150 rounded border ${
        isSelected ? 'border-blue-500' : 'border-gray-300'
      } ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 10 : isDragging ? 15 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="text-content w-full h-full flex items-center justify-center px-2 py-1 overflow-hidden pointer-events-none"
        style={{
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          color: element.isNumberVariable ? '#7C3AED' : '#1F2937',
          fontWeight: element.isNumberVariable ? 'bold' : 'normal',
        }}
      >
        {element.text}
      </div>
      
      {/* Selection indicators */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
          
          {/* Resize handle */}
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm cursor-se-resize hover:bg-blue-700 transition-colors"
            onMouseDown={handleResizeMouseDown}
          ></div>
          
          {/* Element type indicator */}
          <div className="absolute -top-7 left-0 text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap shadow-sm">
            {element.isNumberVariable ? 'Number Variable' : 'Text Element'}
          </div>
        </>
      )}
    </div>
  );
};

export default DraggableText;