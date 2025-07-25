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
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number | "auto";
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
      text: '001',
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
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
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

  // Updated upload handler: accepts SVG, PNG, JPG/JPEG as background/template
  const handleBackgroundUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'image/svg+xml') {
      // SVG: read as text
      const reader = new FileReader();
      reader.onload = (e) => {
        setCouponTemplate(e.target?.result as string);
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/png') || file.type.startsWith('image/jpeg')) {
      // PNG/JPG: read as data URL and use img as template
      const reader = new FileReader();
      reader.onload = (e) => {
        setCouponTemplate(`<img src="${e.target?.result}" style="width:100%;height:100%;object-fit:cover;display:block;" />`);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Unsupported file type. Please upload SVG, PNG, or JPG.');
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

    const usedFonts = customFonts.filter(font =>
      elements.some(el => el.fontFamily === font.family)
    );

    const fontFaceCSS = await Promise.all(
      usedFonts.map(async (font) => {
        const base64 = await fetchFontBase64(font.url);
        if (!base64) return '';
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

    const getTextAnchor = (align?: string) => {
      if (align === 'center') return 'middle';
      if (align === 'right') return 'end';
      return 'start';
    };
    const getTextX = (el: TextElement) => {
      if (el.textAlign === 'center') return el.x + el.width / 2;
      if (el.textAlign === 'right') return el.x + el.width;
      return el.x;
    };

    const styleTag = fontFaceCSS.join('\n').trim()
      ? `<style><![CDATA[\n${fontFaceCSS.join('\n')}\n]]></style>`
      : '';

    const textNodes = elements.map(el => {
      const borderRadius = 6;
      const borderWidth = 1;
      const hasBackground = el.backgroundColor && el.backgroundColor !== "transparent";
      // BORDER IS ALWAYS TRANSPARENT
      return `
        <g>
          <rect
            x="${el.x}"
            y="${el.y}"
            width="${el.width}"
            height="${el.height}"
            fill="${hasBackground ? el.backgroundColor : 'none'}"
            stroke="transparent"
            stroke-width="${borderWidth}"
            rx="${borderRadius}"
          />
          <text
            x="${getTextX(el)}"
            y="${el.y + el.height / 2}"
            text-anchor="${getTextAnchor(el.textAlign)}"
            dominant-baseline="middle"
            font-family="${el.fontFamily}"
            font-size="${el.fontSize}"
            fill="${el.fontColor || (el.isNumberVariable ? '#7C3AED' : '#1F2937')}"
            font-weight="${el.isNumberVariable ? 'bold' : 'normal'}"
            letter-spacing="${el.letterSpacing ? el.letterSpacing : 0}"
          >
            ${el.text}
          </text>
        </g>
      `;
    }).join('');

    svgBase = svgBase.replace('</svg>', `${styleTag}${textNodes}</svg>`);
    return svgBase;
  },
  [couponTemplate, customFonts]
);


  // Updated: support export as SVG, PNG, or JPG
const generateCoupons = useCallback(
  async (
    startNumber: number,
    count: number,
    prefix: string = '',
    numberLength: number = 4,
    format: 'svg' | 'png' | 'jpg' = 'svg',
    resolution?: { width: number, height: number } // <-- Accept resolution!
  ) => {
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

      let imgData = null;
      let fileName = `coupon_${formattedNumber}.${format}`;
      if (format === 'svg') {
        zip.file(fileName, svgContent);
      } else {
        // Use custom resolution, fallback to 400x200 if not set
        const width = resolution?.width || 400;
        const height = resolution?.height || 200;
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        const image = new window.Image();
        imgData = await new Promise<string>((resolve, reject) => {
          image.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              // Fill white bg for JPG
              if (format === 'jpg') {
                ctx!.fillStyle = "#fff";
                ctx!.fillRect(0, 0, width, height);
              }
              ctx?.drawImage(image, 0, 0, width, height);
              const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
              const dataUrl = canvas.toDataURL(mimeType, 1.0);
              zip.file(fileName, dataUrl.split(',')[1], { base64: true });
              resolve(dataUrl);
            } catch (err) {
              reject(err);
            } finally {
              URL.revokeObjectURL(url);
            }
          };
          image.onerror = reject;
          image.src = url;
        });
      }

      coupons.push({
        id: `coupon-${i}`,
        number: formattedNumber,
        elements: couponElements,
        svgContent: svgContent,
        imgData: imgData,
      });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `coupons_${startNumber}-${startNumber + count - 1}.zip`);
    return coupons;
  },
  [textElements, couponTemplate, customFonts]
);

  const exportCoupons = useCallback((coupons: any[]) => {
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
          {/* Upload SVG/PNG/JPG Template */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg"
              onChange={handleBackgroundUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload SVG/PNG/JPG Template
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
        <div className="flex-1 overflow-y-auto">
          <ControlPanel
            selectedElement={selectedElement ? (textElements.find(el => el.id === selectedElement) || null) : null}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            customFonts={customFonts}
          />
        </div>
      </div>
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