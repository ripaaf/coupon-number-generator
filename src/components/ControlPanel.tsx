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
      <div className="p-6 text-center text-gray-500">
        <Type className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select an element to edit its properties</p>
      </div>
    );
  }

  const systemFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'monospace', 'serif', 'sans-serif', 'cursive', 'fantasy'
  ];

  const allFonts = [...systemFonts, ...customFonts.map(f => f.family)];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Element Properties</h3>
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete element"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Element Type */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Palette className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium">
          {selectedElement.isNumberVariable ? 'Number Variable' : 'Text Element'}
        </span>
      </div>

      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {selectedElement.isNumberVariable ? 'Preview Number' : 'Text Content'}
        </label>
        <textarea
          value={selectedElement.text}
          onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
          placeholder={selectedElement.isNumberVariable ? "000001" : "Enter text..."}
        />
        {selectedElement.isNumberVariable && (
          <p className="text-xs text-gray-500 mt-1">
            This will be replaced with generated numbers
          </p>
        )}
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">X Position</label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Y Position</label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Font Color */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Font Color</label>
  <input
    type="color"
    value={selectedElement.fontColor || "#1F2937"}
    onChange={e => onUpdateElement(selectedElement.id, { fontColor: e.target.value })}
    className="w-full h-10"
  />
</div>

{/* Background Color */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
  <input
    type="color"
    value={selectedElement.backgroundColor || "transparent"}
    onChange={e => onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })}
    className="w-full h-10"
  />
  <button
    onClick={() => onUpdateElement(selectedElement.id, { backgroundColor: "transparent" })}
    className="mt-1 text-xs text-blue-600 underline"
  >
    Set Transparent
  </button>
</div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
          <input
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 50 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
          <input
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 20 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Font Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
        <select
          value={selectedElement.fontFamily}
          onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size: {selectedElement.fontSize}px
        </label>
        <input
          type="range"
          min="8"
          max="72"
          value={selectedElement.fontSize}
          onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>8px</span>
          <span>72px</span>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
        <div
          style={{
            fontSize: selectedElement.fontSize,
            fontFamily: selectedElement.fontFamily,
            color: selectedElement.isNumberVariable ? '#7C3AED' : '#1F2937',
            fontWeight: selectedElement.isNumberVariable ? 'bold' : 'normal',
          }}
        >
          {selectedElement.text}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;