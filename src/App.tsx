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

// --- Add for Advanced Number Generation ---
interface AdvancedOptions {
  formatting: 'uppercase' | 'lowercase' | 'randomcase';
  customChars: string;
  randomizeOrder: boolean;
  uniqueOnly: boolean;
  usePrefix: boolean;
  separator: string;
}
const defaultAdvanced: AdvancedOptions = {
  formatting: 'uppercase',
  customChars: '',
  randomizeOrder: false,
  uniqueOnly: true,
  usePrefix: true,
  separator: '', 
};
function applyFormatting(str: string, formatting: AdvancedOptions['formatting']) {
  switch (formatting) {
    case 'uppercase': return str.toUpperCase();
    case 'lowercase': return str.toLowerCase();
    case 'randomcase':
      return Array.from(str).map(char =>
        Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
      ).join('');
    default: return str;
  }
}
function generateRandomString(length: number, chars: string) {
  let result = '';
  for (let i = 0; i < length; ++i) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// ---

function App() {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [showNumberGenerator, setShowNumberGenerator] = useState(false);
  const [showFontManager, setShowFontManager] = useState(false);
  const [couponTemplate, setCouponTemplate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedElement, setCopiedElement] = useState<TextElement | null>(null);

  // --- Advanced Generator State ---
  const [advanced, setAdvanced] = useState<AdvancedOptions>({ ...defaultAdvanced });

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
        const lines = String(el.text).split('\n');
        const isAuto = !el.lineHeight || el.lineHeight === "auto";
        const fontSize = el.fontSize;
        const lineHeight = isAuto ? 1.2 : Number(el.lineHeight);

        let textY: number;
        let tspans: string;

        if (isAuto) {
          textY = el.y + el.height / 2;
          tspans = lines.map((line, i) =>
            `<tspan x="${getTextX(el)}" dy="${i === 0 ? 0 : fontSize * lineHeight}">${line || ' '}</tspan>`
          ).join('');
        } else {
          textY = el.y + fontSize;
          tspans = lines.map((line, i) =>
            `<tspan x="${getTextX(el)}" dy="${i === 0 ? 0 : fontSize * lineHeight}">${line || ' '}</tspan>`
          ).join('');
        }

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
              y="${textY}"
              text-anchor="${getTextAnchor(el.textAlign)}"
              font-family="${el.fontFamily}"
              font-size="${el.fontSize}"
              fill="${el.fontColor || (el.isNumberVariable ? '#7C3AED' : '#1F2937')}"
              font-weight="${el.isNumberVariable ? 'bold' : 'normal'}"
              letter-spacing="${el.letterSpacing ? el.letterSpacing : 0}"
              ${isAuto ? 'dominant-baseline="middle"' : 'dominant-baseline="hanging"'}
            >${tspans}</text>
          </g>
        `;
      }).join('');

      svgBase = svgBase.replace('</svg>', `${styleTag}${textNodes}</svg>`);
      return svgBase;
    },
    [couponTemplate, customFonts]
  );

  // Updated: support advanced options for number generation
  const generateCoupons = useCallback(
    async (
      startNumber: number,
      count: number,
      prefix: string = '',
      numberLength: number = 4,
      format: 'svg' | 'png' | 'jpg' = 'svg',
      resolution?: { width: number, height: number },
      advancedOptions?: AdvancedOptions
    ) => {
      const numberElements = textElements.filter(el => el.isNumberVariable);
      if (numberElements.length === 0) return [];

      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');

      const zip = new JSZip();
      let coupons: any[] = [];

      // --- Advanced Generation Logic ---
      let numbers: string[] = [];
      const adv = advancedOptions || advanced;
      let sep = adv.separator || '';

    if (adv.customChars && adv.customChars.length > 0) {
      // Generate random codes with customChars (unique if needed)
      const generated = new Set<string>();
      while (numbers.length < count) {
        let code = generateRandomString(numberLength, adv.customChars);
        if (adv.uniqueOnly && generated.has(code)) continue;
        generated.add(code);
        let result = adv.usePrefix && prefix
          ? `${prefix}${sep}${code}`
          : code;
        result = applyFormatting(result, adv.formatting);
        numbers.push(result);
      }
    } else {
      // Sequential generation, format and prefix
      for (let i = 0; i < count; i++) {
        let code = (startNumber + i).toString().padStart(numberLength, '0');
        let result = adv.usePrefix && prefix
          ? `${prefix}${sep}${code}`
          : code;
        result = applyFormatting(result, adv.formatting);
        numbers.push(result);
      }
      if (adv.uniqueOnly) {
        numbers = Array.from(new Set(numbers));
      }
    }
    if (adv.randomizeOrder) {
      numbers = numbers
        .map((n, i) => ({ i, n, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(obj => obj.n);
    }
      // ---

      for (let i = 0; i < numbers.length; i++) {
        const code = numbers[i];
        const couponElements = textElements.map(el => ({
          ...el,
          text: el.isNumberVariable ? code : el.text,
        }));
        const svgContent = await generateSVGContent(couponElements);

        let imgData = null;
        let fileName = `coupon_${code}.${format}`;
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
          number: code,
          elements: couponElements,
          svgContent: svgContent,
          imgData: imgData,
        });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `coupons_${numbers[0] || '0000'}-${numbers[numbers.length - 1] || 'end'}.zip`);
      return coupons;
    },
    [textElements, couponTemplate, customFonts, advanced]
  );

  const exportCoupons = useCallback((coupons: any[]) => {
    // place for custom after-export logic
    console.log('Coupons exported successfully:', coupons.length);
  }, []);

  const resetCanvas = useCallback(() => {
    setTextElements([]);
    setSelectedElement(null);
    setCouponTemplate('');
  }, []);

  // Responsive drawer for Control Panel
  const [controlPanelOpen, setControlPanelOpen] = useState(true);

  useEffect(() => {
    if (selectedElement) setControlPanelOpen(true);
  }, [selectedElement]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50 font-inter">
      {/* --- Top Action Bar --- */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-md px-2 sm:px-6 py-2 flex items-center gap-2 sm:gap-4 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-700 tracking-tight mr-3 select-none">Coupon Canvas</span>
        <button
          onClick={addTextElement}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-green-500/90 hover:bg-green-600 transition text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          title="Add Text (T)"
        >
          <Type className="w-4 h-4" /> <span className="hidden sm:inline">Text</span>
        </button>
        <button
          onClick={addNumberVariable}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-500/90 hover:bg-purple-600 transition text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          title="Add Generated Number Variable (N)"
        >
          <Hash className="w-4 h-4" /> <span className="hidden sm:inline">Prefix</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Upload SVG, PNG, or JPG"
        >
          <Upload className="w-4 h-4" /> <span className="hidden sm:inline">Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,.png,.jpg,.jpeg"
          onChange={handleBackgroundUpload}
          className="hidden"
        />
        <button
          onClick={copyElement}
          disabled={!selectedElement}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Copy Element"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={pasteElement}
          disabled={!copiedElement}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Paste Element"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          onClick={() => selectedElement && deleteElement(selectedElement)}
          disabled={!selectedElement}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
          title="Delete Element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={duplicateElement}
          disabled={!selectedElement}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-yellow-400/90 hover:bg-yellow-500 text-gray-900 rounded-lg text-xs sm:text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          title="Duplicate Element"
        >
          <span className="font-bold">D</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowFontManager(true)}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-indigo-500/90 hover:bg-indigo-600 text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Fonts</span>
        </button>
        <button
          onClick={resetCanvas}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Reset Canvas"
        >
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Reset</span>
        </button>
        <button
          onClick={() => setShowNumberGenerator(true)}
          className="flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 hover:from-orange-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <Download className="w-4 h-4" /> <span className="hidden sm:inline">Generate</span>
        </button>
      </nav>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Canvas Area */}
        <main className="flex-1 flex justify-center items-center bg-gradient-to-br from-gray-100 via-white to-blue-100 min-h-[calc(100vh-64px)]">
          <div className="w-full flex justify-center items-center h-full overflow-auto">
            <div
              className="relative shadow-xl border border-gray-100 flex items-center justify-center"
              style={{ width: 850, height: 550, minWidth: 320, minHeight: 200, background: '#F3F4F6' }}
            >
              <CouponCanvas
                textElements={textElements}
                onUpdateElement={updateElement}
                onSelectElement={selectElement}
                selectedElement={selectedElement}
                couponTemplate={couponTemplate}
              />
            </div>
          </div>
        </main>

        {/* Control Panel (side on desktop, drawer on mobile) */}
        <aside
          className={`
            fixed bottom-0 left-0 right-0 z-30 md:static md:w-[340px] md:max-w-sm bg-white/95
            md:bg-white/80 md:backdrop-blur md:shadow-xl
            border-t border-gray-200 md:border-t-0 md:border-l md:border-gray-100
            transition-all duration-300
            ${!controlPanelOpen ? 'translate-y-full md:translate-y-0' : 'translate-y-0'}
            h-[60vh] md:h-auto
            rounded-t-2xl md:rounded-t-none md:rounded-l-2xl
            overflow-auto
          `}
        >
          {/* Close handle for mobile */}
          <div className="md:hidden flex justify-center py-2">
            <button
              className="w-10 h-1 bg-gray-300 rounded-full mb-1"
              onClick={() => setControlPanelOpen(false)}
              aria-label="Close properties"
            />
          </div>
          <ControlPanel
            selectedElement={selectedElement ? (textElements.find(el => el.id === selectedElement) || null) : null}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            customFonts={customFonts}
          />
        </aside>
      </div>

      {/* Floating open button for control panel (mobile only) */}
      {!controlPanelOpen && selectedElement && (
        <button
          className="md:hidden fixed bottom-4 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setControlPanelOpen(true)}
          aria-label="Show properties"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {/* Popups */}
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