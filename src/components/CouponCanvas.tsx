import React, { useRef, useCallback } from 'react';
import DraggableText from './DraggableText';
import { TextElement } from '../App';

interface CouponCanvasProps {
  textElements: TextElement[];
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  onSelectElement: (id: string | null) => void;
  selectedElement: string | null;
  couponTemplate: string;
}

const CouponCanvas: React.FC<CouponCanvasProps> = ({
  textElements,
  onUpdateElement,
  onSelectElement,
  selectedElement,
  couponTemplate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    if (event.target === canvasRef.current || event.target === event.currentTarget) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  const defaultTemplate = `
    <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="couponGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/>
        </pattern>
      </defs>
      
      <!-- Main coupon body -->
      <rect width="400" height="200" fill="url(#couponGradient)" rx="8"/>
      <rect width="400" height="200" fill="url(#dots)" rx="8"/>
      
      <!-- Decorative border -->
      <rect x="8" y="8" width="384" height="184" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="4" stroke-dasharray="5,5"/>
      
      <!-- Side perforations -->
      <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,3"/>
      
      <!-- Corner decorations -->
      <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="370" cy="30" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="30" cy="170" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="370" cy="170" r="3" fill="rgba(255,255,255,0.3)"/>
    </svg>
  `;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Coupon Design</h2>
      
      <div 
        ref={canvasRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
        onClick={handleCanvasClick}
        style={{ minHeight: '500px', width: '800px', height: '500px' }}
      >
        {/* SVG Template */}
        <div 
          className="absolute inset-0 pointer-events-none select-none"
          dangerouslySetInnerHTML={{ 
            __html: couponTemplate || defaultTemplate 
          }}
        />
        
        {/* Text Elements */}
        {textElements.map((element) => (
          <DraggableText
            key={element.id}
            element={element}
            isSelected={element.id === selectedElement}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onSelect={() => onSelectElement(element.id)}
            canvasRef={canvasRef}
          />
        ))}
        
        {/* Helper text when canvas is empty */}
        {textElements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Start designing your coupon</p>
              <p className="text-sm">Add text elements or upload an SVG template</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Tips:</strong> Click elements to select • Drag to move • Use the sidebar to customize</p>
      </div>
    </div>
  );
};

export default CouponCanvas;