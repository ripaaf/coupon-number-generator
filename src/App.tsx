import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, RotateCcw, Type, Hash, Settings, Copy, Trash2 } from 'lucide-react';
import CouponCanvas from './components/CouponCanvas';
import ControlPanel from './components/ControlPanel';
import NumberGenerator from './components/NumberGenerator';
import FontManager from './components/FontManager';

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  width: number;
  height: number;
  isSelected: boolean;
  isNumberVariable: boolean;
  backgroundColor?: string;
  fontColor?: string;
}

export interface CustomFont {
  name: string;
  url: string;
  family: string;
}

function App() {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [showNumberGenerator, setShowNumberGenerator] = useState(false);
  const [showFontManager, setShowFontManager] = useState(false);
  const [couponTemplate, setCouponTemplate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedElement, setCopiedElement] = useState<TextElement | null>(null);

  const addTextElement = useCallback(() => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: 'New Text',
      x: 100,
      y: 100,
      fontSize: 16,
      fontFamily: 'Arial',
      width: 120,
      height: 30,
      isSelected: false,
      isNumberVariable: false,
      backgroundColor: 'transparent',
      fontColor: '#1F2937',
    };
    setTextElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, []);

  const addNumberVariable = useCallback(() => {
    const newElement: TextElement = {
      id: `number-${Date.now()}`,
      text: '0001',
      x: 150,
      y: 150,
      fontSize: 20,
      fontFamily: 'monospace',
      width: 80,
      height: 35,
      isSelected: false,
      isNumberVariable: true,
      backgroundColor: 'transparent',
      fontColor: '#7C3AED',
    };
    setTextElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  }, []);

  const deleteElement = useCallback((id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const selectElement = useCallback((id: string | null) => {
    setTextElements(prev => 
      prev.map(el => ({ ...el, isSelected: el.id === id }))
    );
    setSelectedElement(id);
  }, []);

  const duplicateElement = useCallback(() => {
    if (selectedElement) {
      const elementToDuplicate = textElements.find(el => el.id === selectedElement);
      if (elementToDuplicate) {
        const newElement: TextElement = {
          ...elementToDuplicate,
          id: `${elementToDuplicate.isNumberVariable ? 'number' : 'text'}-${Date.now()}`,
          x: elementToDuplicate.x + 20,
          y: elementToDuplicate.y + 20,
          isSelected: false,
        };
        setTextElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
      }
    }
  }, [selectedElement, textElements]);

  const copyElement = useCallback(() => {
    if (selectedElement) {
      const elementToCopy = textElements.find(el => el.id === selectedElement);
      if (elementToCopy) {
        setCopiedElement(elementToCopy);
      }
    }
  }, [selectedElement, textElements]);

  const pasteElement = useCallback(() => {
    if (copiedElement) {
      const newElement: TextElement = {
        ...copiedElement,
        id: `${copiedElement.isNumberVariable ? 'number' : 'text'}-${Date.now()}`,
        x: copiedElement.x + 20,
        y: copiedElement.y + 20,
        isSelected: false,
      };
      setTextElements(prev => [...prev, newElement]);
      setSelectedElement(newElement.id);
    }
  }, [copiedElement]);

  // Keyboard shortcuts & Arrow key movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Arrow keys for moving selected element
      if (
        selectedElement &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      ) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        setTextElements(prev =>
          prev.map(el => {
            if (el.id !== selectedElement) return el;
            let { x, y } = el;
            if (event.key === 'ArrowUp') y -= step;
            else if (event.key === 'ArrowDown') y += step;
            else if (event.key === 'ArrowLeft') x -= step;
            else if (event.key === 'ArrowRight') x += step;
            return { ...el, x, y };
          })
        );
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElement) {
          deleteElement(selectedElement);
        }
      } else if (event.key === 't' || event.key === 'T') {
        addTextElement();
      } else if (event.key === 'n' || event.key === 'N') {
        addNumberVariable();
      } else if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'c':
            event.preventDefault();
            copyElement();
            break;
          case 'v':
            event.preventDefault();
            pasteElement();
            break;
          case 'd':
            event.preventDefault();
            duplicateElement();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElement,
    deleteElement,
    addTextElement,
    addNumberVariable,
    copyElement,
    pasteElement,
    duplicateElement,
  ]);

  const handleSVGUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgContent = e.target?.result as string;
        setCouponTemplate(svgContent);
      };
      reader.readAsText(file);
    }
  }, []);

  // --- FULL FIX: EMBED FONTS IN SVG EXPORT ---
  const fetchFontBase64 = async (url: string): Promise<string | null> => {
    try {
      const resp = await fetch(url);
      const fontBuffer = await resp.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(fontBuffer)));
    } catch {
      return null;
    }
  };

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
      <rect width="400" height="200" fill="url(#couponGradient)" rx="8"/>
      <rect width="400" height="200" fill="url(#dots)" rx="8"/>
      <rect x="8" y="8" width="384" height="184" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="4" stroke-dasharray="5,5"/>
      <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="3,3"/>
      <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="370" cy="30" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="30" cy="170" r="3" fill="rgba(255,255,255,0.3)"/>
      <circle cx="370" cy="170" r="3" fill="rgba(255,255,255,0.3)"/>
    </svg>
  `;

  // Async SVG generator with embedded fonts
  const generateSVGContent = useCallback(
    async (elements: TextElement[]) => {
      let svgBase = couponTemplate || defaultTemplate;

      // Find all custom font families used in these elements
      const usedFonts = customFonts.filter(font =>
        elements.some(el => el.fontFamily === font.family)
      );

      // Build font-face CSS for SVG <style>
      const fontFaceCSS = await Promise.all(
        usedFonts.map(async (font) => {
          const base64 = await fetchFontBase64(font.url);
          if (!base64) return '';
          // Guess format from URL
          const ext = font.url.split('.').pop()?.toLowerCase();
          let format = 'truetype';
          if (ext === 'woff') format = 'woff';
          if (ext === 'woff2') format = 'woff2';
          if (ext === 'otf') format = 'opentype';
          return `
            @font-face {
              font-family: '${font.family}';
              src: url(data:font/${format};base64,${base64}) format('${format}');
              font-weight: normal;
              font-style: normal;
            }
          `;
        })
      );

      const styleTag = fontFaceCSS.join('\n').trim()
        ? `<style><![CDATA[\n${fontFaceCSS.join('\n')}\n]]></style>`
        : '';

      // Compose text nodes
      const textNodes = elements.map(el => `
        <g>
          ${el.backgroundColor && el.backgroundColor !== "transparent"
            ? `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.backgroundColor}" rx="4"/>`
            : ""
          }
          <text x="${el.x + el.width/2}" y="${el.y + el.height/2}"
            text-anchor="middle" dominant-baseline="middle"
            font-family="${el.fontFamily}" font-size="${el.fontSize}"
            fill="${el.fontColor || (el.isNumberVariable ? '#7C3AED' : '#1F2937')}"
            font-weight="${el.isNumberVariable ? 'bold' : 'normal'}">
            ${el.text}
          </text>
        </g>
      `).join('');

      svgBase = svgBase.replace('</svg>', `${styleTag}${textNodes}</svg>`);
      return svgBase;
    },
    [couponTemplate, customFonts]
  );

  // --- FIX: generateCoupons is now async and uses await generateSVGContent ---
  const generateCoupons = useCallback(
    async (startNumber: number, count: number, prefix: string = '', numberLength: number = 4) => {
      const numberElements = textElements.filter(el => el.isNumberVariable);
      if (numberElements.length === 0) return [];

      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');

      const zip = new JSZip();
      const coupons = [];

      for (let i = 0; i < count; i++) {
        const currentNumber = startNumber + i;
        const formattedNumber = prefix + currentNumber.toString().padStart(numberLength, '0');

        const couponElements = textElements.map(el => ({
          ...el,
          text: el.isNumberVariable ? formattedNumber : el.text,
        }));

        const svgContent = await generateSVGContent(couponElements);

        const couponData = {
          id: `coupon-${i}`,
          number: formattedNumber,
          elements: couponElements,
          svgContent : svgContent,
        };

        coupons.push(couponData);

        // Generate SVG for this coupon (await for fonts!)
        zip.file(`coupon_${formattedNumber}.svg`, svgContent);
      }

      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `coupons_${startNumber}-${startNumber + count - 1}.zip`);

      return coupons;
    },
    [textElements, couponTemplate, generateSVGContent]
  );

  const exportCoupons = useCallback((coupons: any[]) => {
    // The export is now handled in generateCoupons function
    console.log('Coupons exported successfully:', coupons.length);
  }, []);

  const resetCanvas = useCallback(() => {
    setTextElements([]);
    setSelectedElement(null);
    setCouponTemplate('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Coupon Designer</h1>
          
          {/* Upload SVG Template */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleSVGUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload SVG Template
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={addTextElement}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="Add Text (T)"
            >
              <Type className="w-4 h-4" />
              Add Text
            </button>
            <button
              onClick={addNumberVariable}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              title="Add Number (N)"
            >
              <Hash className="w-4 h-4" />
              Add Number
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={copyElement}
              disabled={!selectedElement}
              className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy (Ctrl+C)"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
            <button
              onClick={pasteElement}
              disabled={!copiedElement}
              className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Paste (Ctrl+V)"
            >
              <Type className="w-3 h-3" />
              Paste
            </button>
            <button
              onClick={() => selectedElement && deleteElement(selectedElement)}
              disabled={!selectedElement}
              className="flex items-center justify-center gap-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete (Del)"
            >
              <Trash2 className="w-3 h-3" />
              Del
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setShowFontManager(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Settings className="w-4 h-4" />
              Fonts
            </button>
            <button
              onClick={resetCanvas}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <button
            onClick={() => setShowNumberGenerator(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Generate Coupons
          </button>
        </div>

        {/* Control Panel */}
        <div className="flex-1 overflow-y-auto">
          <ControlPanel
            selectedElement={selectedElement ? (textElements.find(el => el.id === selectedElement) || null) : null}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            customFonts={customFonts}
          />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex justify-center">
            <CouponCanvas
              textElements={textElements}
              onUpdateElement={updateElement}
              onSelectElement={selectElement}
              selectedElement={selectedElement}
              couponTemplate={couponTemplate}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs text-gray-600 max-w-xs">
        <p className="font-medium mb-2">Keyboard Shortcuts:</p>
        <div className="space-y-1">
          <p><kbd className="bg-gray-100 px-1 rounded">T</kbd> Add Text</p>
          <p><kbd className="bg-gray-100 px-1 rounded">N</kbd> Add Number</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Ctrl+C</kbd> Copy</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Ctrl+V</kbd> Paste</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Del</kbd> Delete</p>
          <p><kbd className="bg-gray-100 px-1 rounded">Arrow Keys</kbd> Move Selected (Shift for 10px)</p>
        </div>
      </div>

      {/* Modals */}
      {showNumberGenerator && (
        <NumberGenerator
          onClose={() => setShowNumberGenerator(false)}
          onGenerate={generateCoupons}
          onExport={exportCoupons}
        />
      )}

      {showFontManager && (
        <FontManager
          fonts={customFonts}
          onClose={() => setShowFontManager(false)}
          onAddFont={(font) => setCustomFonts(prev => [...prev, font])}
          onRemoveFont={(fontName) => setCustomFonts(prev => prev.filter(f => f.name !== fontName))}
        />
      )}
    </div>
  );
}

export default App;