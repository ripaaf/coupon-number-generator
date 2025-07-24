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

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GRID_SPACING = 30; // px
const GRID_COLOR = "#ffff";
const GRID_BG = "#D2D2D2";

const CouponCanvas: React.FC<CouponCanvasProps> = ({
  textElements,
  onUpdateElement,
  onSelectElement,
  selectedElement,
  couponTemplate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (event.target === canvasRef.current || event.target === event.currentTarget) {
      onSelectElement(null);
    }
  }, [onSelectElement]);

  // Render grid dots as SVG
  const renderGrid = () => {
    const cols = Math.floor(CANVAS_WIDTH / GRID_SPACING);
    const rows = Math.floor(CANVAS_HEIGHT / GRID_SPACING);
    const dots: JSX.Element[] = [];

    for (let x = 0; x <= cols; x++) {
      for (let y = 0; y <= rows; y++) {
        dots.push(
          <circle
            key={`dot-${x}-${y}`}
            cx={x * GRID_SPACING}
            cy={y * GRID_SPACING}
            r={1.5}
            fill={GRID_COLOR}
          />
        );
      }
    }

    return (
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          display: 'block'
        }}
      >
        <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={GRID_BG} />
        {dots}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Coupon Design</h2>
      
      <div 
        ref={canvasRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        onClick={handleCanvasClick}
        style={{ minHeight: `${CANVAS_HEIGHT}px`, width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
      >
        {/* Grid */}
        {renderGrid()}

        {/* SVG Background (if any) */}
        {couponTemplate && (
          <div
            className="absolute inset-0 pointer-events-none select-none"
            style={{ zIndex: 1 }}
            dangerouslySetInnerHTML={{
              __html: couponTemplate,
            }}
          />
        )}

        {/* Text Elements (always shown) */}
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Start designing your coupon</p>
              <p className="text-sm">Add text elements or upload an SVG template</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Tips:</strong> Click elements to select • Drag to move • Use the sidebar to customize • Use arrow keys to move selected element</p>
      </div>
    </div>
  );
};

export default CouponCanvas;