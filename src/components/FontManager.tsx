import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Type } from 'lucide-react';
import { CustomFont } from '../App';

interface FontManagerProps {
  fonts: CustomFont[];
  onClose: () => void;
  onAddFont: (font: CustomFont) => void;
  onRemoveFont: (fontName: string) => void;
}

const FontManager: React.FC<FontManagerProps> = ({
  fonts,
  onClose,
  onAddFont,
  onRemoveFont,
}) => {
  const [fontName, setFontName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Create a URL for the font file
      const fontUrl = URL.createObjectURL(file);
      
      // Generate a unique font family name
      const fontFamily = `custom-${fontName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      // Create a style element to load the font
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('${getFontFormat(file.name)}');
          font-display: swap;
        }
      `;
      document.head.appendChild(style);

      // Wait a bit for the font to load
      await new Promise(resolve => setTimeout(resolve, 100));

      const newFont: CustomFont = {
        name: fontName.trim(),
        url: fontUrl,
        family: fontFamily,
      };

      onAddFont(newFont);
      setFontName('');
      
      // Reset the file input
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

  const getFontFormat = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'woff2': return 'woff2';
      case 'woff': return 'woff';
      case 'ttf': return 'truetype';
      case 'otf': return 'opentype';
      default: return 'truetype';
    }
  };

  const handleRemoveFont = (font: CustomFont) => {
    if (confirm(`Are you sure you want to remove the font "${font.name}"?`)) {
      // Clean up the object URL
      URL.revokeObjectURL(font.url);
      onRemoveFont(font.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
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

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Upload Section */}
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
                Supported formats: TTF, OTF, WOFF, WOFF2
              </p>
            </div>
          </div>

          {/* Fonts List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">
              Custom Fonts ({fonts.length})
            </h3>

            {fonts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No custom fonts uploaded yet</p>
                <p className="text-sm">Upload a font file to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fonts.map((font) => (
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

          {/* Font Usage Guide */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Usage Guide:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload font files in TTF, OTF, WOFF, or WOFF2 format</li>
              <li>• Give your fonts descriptive names for easy identification</li>
              <li>• Custom fonts will appear in the font dropdown when editing text elements</li>
              <li>• Fonts are stored in your browser session and won't persist after refresh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontManager;