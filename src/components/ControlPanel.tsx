import React from 'react';
import { Trash2, Type, Palette } from 'lucide-react';
import { TextElement, CustomFont } from '../App';

interface ControlPanelProps {
  selectedElement: TextElement | null;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  onDeleteElement: (id: string) => void;
  customFonts: CustomFont[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  customFonts,
}) => {
  if (!selectedElement) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-gray-400">
        <Type className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs">Select an element to edit</p>
        <div className="bg-white/80 backdrop-blur mt-4 p-2 rounded-lg shadow border border-gray-100 text-xs text-gray-500 max-w-xs">
          <p className="font-bold mb-1">Shortcuts</p>
          <div className="flex flex-wrap gap-1 justify-center">
            <span><kbd className="bg-gray-100 px-1 rounded">T</kbd> Text</span>
            <span><kbd className="bg-gray-100 px-1 rounded">N</kbd> Number</span>
            <span><kbd className="bg-gray-100 px-1 rounded">Ctrl+C</kbd> Copy</span>
            <span><kbd className="bg-gray-100 px-1 rounded">Ctrl+V</kbd> Paste</span>
            <span><kbd className="bg-gray-100 px-1 rounded">Del</kbd> Delete</span>
            <span><kbd className="bg-gray-100 px-1 rounded">←↑→↓</kbd> Move</span>
          </div>
        </div>
      </div>
    );
  }

  const systemFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'monospace', 'serif', 'sans-serif', 'cursive', 'fantasy'
  ];
  const letterSpacingValue = selectedElement.letterSpacing ?? 0;
  const textAlignValue = selectedElement.textAlign ?? 'left';
  const lineHeightValue = selectedElement.lineHeight ?? "auto";
  const isAuto = lineHeightValue === "auto";

  return (
    <div className="p-3 bg-white/80 backdrop-blur rounded-xl shadow-md border border-gray-100 max-w-full w-full min-w-0 max-h-screen overflow-y-auto flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Element Properties</h3>
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition"
          title="Delete element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Element Type */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-700">
        <Palette className="w-4 h-4 text-gray-500" />
        {selectedElement.isNumberVariable ? 'Number Variable' : 'Text Element'}
      </div>

      {/* Text Content */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-0.5">
          {selectedElement.isNumberVariable ? 'Preview Number' : 'Text Content'}
        </label>
        <textarea
          value={selectedElement.text}
          onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
          className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200 transition"
          rows={2}
          placeholder={selectedElement.isNumberVariable ? "001" : "Enter text..."}
        />
        {selectedElement.isNumberVariable && (
          <div className="text-[10px] text-gray-400 mt-0.5">
            This will be replaced with generated numbers
          </div>
        )}
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">X</label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Y</label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Font & Background Color */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Font Color</label>
          <input
            type="color"
            value={selectedElement.fontColor || "#1F2937"}
            onChange={e => onUpdateElement(selectedElement.id, { fontColor: e.target.value })}
            className="w-full h-7 border-0 bg-transparent cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Background</label>
          <input
            type="color"
            value={selectedElement.backgroundColor || "#FFFFFF"}
            onChange={e => onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })}
            className="w-full h-7 border-0 bg-transparent cursor-pointer"
          />
          <button
            onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: "transparent" })}
            className="block text-[10px] text-blue-600 underline mt-0.5"
            type="button"
          >Transparent</button>
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Width</label>
          <input
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 50 })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Height</label>
          <input
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 20 })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">Font Family</label>
        <select
          value={selectedElement.fontFamily}
          onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
          className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
        >
          <optgroup label="System Fonts">
            {systemFonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </optgroup>
          {customFonts.length > 0 && (
            <optgroup label="Custom Fonts">
              {customFonts.map(font => (
                <option key={font.family} value={font.family} style={{ fontFamily: font.family }}>
                  {font.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">
          Font Size: <span className="font-normal">{selectedElement.fontSize}px</span>
        </label>
        <input
          type="range"
          min="8"
          max="72"
          value={selectedElement.fontSize}
          onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
          <span>8px</span>
          <span>72px</span>
        </div>
      </div>

      {/* Letter Spacing & Line Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">
            Letter Spacing ({letterSpacingValue}px)
          </label>
          <input
            type="number"
            min="-10"
            max="100"
            value={letterSpacingValue}
            onChange={(e) => onUpdateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-0.5">Line Height</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.05"
              value={isAuto ? "" : lineHeightValue}
              onChange={e => {
                if (!isAuto) {
                  const val = parseFloat(e.target.value);
                  onUpdateElement(
                    selectedElement.id,
                    { lineHeight: isNaN(val) ? 1.2 : val }
                  );
                }
              }}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
              disabled={isAuto}
              placeholder="auto"
            />
            <label className="flex items-center gap-1 text-[10px]">
              <input
                type="checkbox"
                checked={isAuto}
                onChange={e =>
                  onUpdateElement(
                    selectedElement.id,
                    { lineHeight: e.target.checked ? "auto" : 1.2 }
                  )
                }
              />
              Auto
            </label>
          </div>
        </div>
      </div>

      {/* Text Align */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-0.5">Text Align</label>
        <select
          value={textAlignValue}
          onChange={e => onUpdateElement(selectedElement.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })}
          className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-1 focus:ring-blue-200"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-gray-100 p-2 bg-gray-50 shadow-inner flex-1 min-h-[40px]">
        <p className="text-xs font-semibold text-gray-500 mb-1">Preview</p>
        <div
          style={{
            fontSize: selectedElement.fontSize,
            fontFamily: selectedElement.fontFamily,
            color: selectedElement.isNumberVariable ? '#7C3AED' : '#1F2937',
            fontWeight: selectedElement.isNumberVariable ? 'bold' : 'normal',
            letterSpacing: `${letterSpacingValue}px`,
            lineHeight: lineHeightValue,
            textAlign: textAlignValue as any,
            backgroundColor: selectedElement.backgroundColor && selectedElement.backgroundColor !== 'transparent'
              ? selectedElement.backgroundColor
              : undefined,
            width: '100%',
            whiteSpace: 'pre-line',
            borderRadius: '0.75rem',
            padding: '0.25rem 0.5rem',
          }}
        >
          {selectedElement.text}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;