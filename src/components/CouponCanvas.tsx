import React, { useRef, useCallback, useState, useEffect } from 'react';
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
const GRID_COLOR = "#E3E3E3"; // subtle gray-200
const GRID_BG = "#f3f4f6"; // subtle gray-100

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

  // Tips bubble state
  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);

  // Close tips when clicking outside
  useEffect(() => {
    if (!showTips) return;
    function handleClick(e: MouseEvent) {
      if (
        tipsRef.current &&
        !tipsRef.current.contains(e.target as Node)
      ) {
        setShowTips(false);
      }
    }
    document.addEventListener('mousedown', handleClick, true);
    return () => document.removeEventListener('mousedown', handleClick, true);
  }, [showTips]);

  // SVG Grid
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
            r={1.2}
            fill={GRID_COLOR}
          />
        );
      }
    }

    return (
      <svg
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ display: 'block' }}
      >
        <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={GRID_BG} />
        {dots}
      </svg>
    );
  };

  const showHelper = textElements.length === 0 && !couponTemplate;

  return (
    <div className="flex justify-center items-center w-full flex-col">
      <div
        ref={canvasRef}
        className="relative border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          background: GRID_BG,
          minWidth: `${CANVAS_WIDTH}px`,
          minHeight: `${CANVAS_HEIGHT}px`,
        }}
        onClick={handleCanvasClick}
        tabIndex={0}
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

        {/* Helper text when canvas is empty and no template */}
        {showHelper && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="text-center text-gray-400">
              <p className="text-xl font-semibold mb-2">Start designing your coupon</p>
              <p className="text-sm">Add text or upload a SVG to begin</p>
            </div>
          </div>
        )}

        {/* Tips Bubble (desktop only) */}
        <div className="hidden lg:block">
          <button
            className="fixed left-8 bottom-8 z-40 rounded-full w-12 h-12 bg-slate-300 hover:bg-blue-700 shadow-lg flex items-center justify-center text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            onClick={() => setShowTips((v) => !v)}
            aria-label="Show Tips"
            style={{
              boxShadow: '0 4px 16px rgba(30,64,175,0.15)',
            }}
            type="button"
          >
            ?
          </button>
          {showTips && (
            <div
              ref={tipsRef}
              className="fixed left-28 bottom-8 z-50 bg-white/95 border border-gray-200 rounded-xl shadow-xl p-4 w-80 text-sm text-gray-700 animate-fade-in"
              style={{
                boxShadow: '0 8px 32px rgba(30,64,175,0.13)',
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="bg-slate-300 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg">?</span>
                <span className="font-semibold text-base text-gray-900">Tips</span>
              </div>
              <div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click elements to select</li>
                  <li>Drag to move</li>
                  <li>Use the control panel to customize</li>
                  <li>Use arrow keys for precise movement</li>
                  <li>Sidebar buttons: Copy, Paste, Delete, Duplicate</li>
                  <li>Keyboard: T/N = add text/number, Ctrl+C/V = Copy/Paste</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponCanvas;