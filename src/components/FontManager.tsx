import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Type } from 'lucide-react';
import { CustomFont } from '../App';

interface CustomFontPersistent extends CustomFont {
  base64?: string; // Add base64 field
}

interface FontManagerProps {
  fonts: CustomFontPersistent[];
  onClose: () => void;
  onAddFont: (font: CustomFontPersistent) => void;
  onRemoveFont: (fontName: string) => void;
}

const LOCAL_STORAGE_KEY = "customFonts_v2";

function getFontFormat(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'woff2': return 'woff2';
    case 'woff': return 'woff';
    case 'ttf': return 'truetype';
    case 'otf': return 'opentype';
    default: return 'truetype';
  }
}

// Convert file to base64 data url
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const saveFontsToStorage = (fonts: CustomFontPersistent[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fonts));
};

const loadFontsFromStorage = (): CustomFontPersistent[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as CustomFontPersistent[];
    }
  } catch {}
  return [];
};

const injectFontFaces = (fonts: CustomFontPersistent[]) => {
  fonts.forEach((font) => {
    if (document.head.querySelector(`style[data-font-family="${font.family}"]`)) return;
    if (!font.base64) return;
    const style = document.createElement("style");
    style.setAttribute("data-font-family", font.family);
    style.textContent = `
      @font-face {
        font-family: '${font.family}';
        src: url('${font.base64}') format('${getFontFormat(font.base64)}');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  });
};

const FontManager: React.FC<FontManagerProps> = ({
  fonts,
  onClose,
  onAddFont,
  onRemoveFont,
}) => {
  const [fontName, setFontName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFonts, setLocalFonts] = useState<CustomFontPersistent[]>([]);

  // Load fonts from localStorage on open
  useEffect(() => {
    const stored = loadFontsFromStorage();
    if (stored.length > 0) {
      injectFontFaces(stored);
      setLocalFonts(stored);
      stored.forEach((font) => {
        if (!fonts.some(f => f.family === font.family)) {
          onAddFont(font);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  // Update localStorage when fonts change
  useEffect(() => {
    saveFontsToStorage(fonts as CustomFontPersistent[]);
    setLocalFonts(fonts as CustomFontPersistent[]);
  }, [fonts]);

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'font/ttf', 'font/otf', 'application/font-woff', 
      'application/font-woff2', 'font/woff', 'font/woff2'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      alert('Please upload a valid font file (.ttf, .otf, .woff, .woff2)');
      return;
    }

    if (!fontName.trim()) {
      alert('Please enter a font name');
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await fileToBase64(file); // <-- base64 data url
      const fontFamily = `custom-${fontName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      const style = document.createElement('style');
      style.setAttribute("data-font-family", fontFamily);
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${base64}') format('${getFontFormat(file.name)}');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);

      const newFont: CustomFontPersistent = {
        name: fontName.trim(),
        url: base64,
        family: fontFamily,
        base64,
      };

      onAddFont(newFont);
      setFontName('');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading font:', error);
      alert('Error uploading font. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFont = (font: CustomFontPersistent) => {
    if (confirm(`Are you sure you want to remove the font "${font.name}"?`)) {
      onRemoveFont(font.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Type className="w-5 h-5" />
            Font Manager
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Upload Custom Font</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Name
                </label>
                <input
                  type="text"
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value)}
                  placeholder="e.g., My Custom Font"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !fontName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Choose Font File'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: TTF, OTF, WOFF, WOFF2. <br />
                <span className="font-bold text-blue-900">Fonts now persist after refresh and always work in export!</span>
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">
              Custom Fonts ({localFonts.length})
            </h3>
            {localFonts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No custom fonts uploaded yet</p>
                <p className="text-sm">Upload a font file to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {localFonts.map((font) => (
                  <div
                    key={font.name}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Type className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{font.name}</p>
                          <p
                            className="text-sm text-gray-600 mt-1"
                            style={{ fontFamily: font.family }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFont(font)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove font"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Usage Guide:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload font files in TTF, OTF, WOFF, or WOFF2 format</li>
              <li>• Give your fonts descriptive names for easy identification</li>
              <li>• Custom fonts will appear in the font dropdown when editing text elements</li>
              <li>• <span className="font-bold text-blue-900">Fonts are persistent and will always export as expected!</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontManager;