import React, { useState } from 'react';
import { X, Hash, FileText } from 'lucide-react';

interface NumberGeneratorProps {
  onClose: () => void;
  onGenerate: (startNumber: number, count: number, prefix: string, numberLength: number) => Promise<any[]>;
  onExport: (coupons: any[]) => void;
}

function getNumberLength(input: string | number) {
  if (typeof input === 'string' && /^\d+$/.test(input)) {
    return input.length;
  }
  if (typeof input === 'number') {
    return input.toString().length;
  }
  return 3;
}

const NumberGenerator: React.FC<NumberGeneratorProps> = ({
  onClose,
  onGenerate,
  onExport,
}) => {
  // Accept startNumber as string for "001", "0001", etc.
  const [startNumberStr, setStartNumberStr] = useState('001');
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('');
  const [numberLength, setNumberLength] = useState(getNumberLength('001'));
  const [generatedCoupons, setGeneratedCoupons] = useState<any[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Auto-update numberLength when typing startNumber
  const handleStartNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, ''); // only digits
    setStartNumberStr(val);
    setNumberLength(val.length || 1); // auto detect
  };

  const handleGenerate = async () => {
    const startNumber = parseInt(startNumberStr, 10) || 0;
    const coupons = await onGenerate(startNumber, count, prefix, numberLength);
    setGeneratedCoupons(coupons);
    setPreviewIndex(0);
  };

  const formatNumber = (num: number) => {
    const startNum = parseInt(startNumberStr, 10) || 0;
    const currentNumber = startNum + num - 1;
    return prefix + currentNumber.toString().padStart(numberLength, '0');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Number Generator
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Number
                </label>
                <input
                  type="text"
                  value={startNumberStr}
                  onChange={handleStartNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="e.g., 001"
                  maxLength={10}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number Length
                </label>
                <input
                  type="number"
                  value={numberLength}
                  onChange={e => setNumberLength(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
                  max={10}
                />
                <div className="text-xs text-gray-500 mt-1">
                  How many digits (e.g. 3 → "001", 4 → "0001")
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
                  max={10000}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., COUP-"
                />
              </div>
            </div>

            {/* Preview of number format */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Number Format Preview:</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2].map(i => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                    {formatNumber(i + 1)}
                  </span>
                ))}
                {count > 3 && <span className="text-blue-600">...</span>}
                {count > 1 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                    {formatNumber(count)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Hash className="w-4 h-4" />
              Generate & Export {count} Coupons
            </button>
          </div>

          {/* Generated Coupons Preview */}
          {generatedCoupons.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Exported Coupons ({generatedCoupons.length})
                </h3>
                <div className="text-sm text-green-600 font-medium">
                  ✓ ZIP file downloaded
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">
                  Preview: {previewIndex + 1} of {generatedCoupons.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                    disabled={previewIndex === 0}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPreviewIndex(Math.min(generatedCoupons.length - 1, previewIndex + 1))}
                    disabled={previewIndex === generatedCoupons.length - 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Coupon Number: {generatedCoupons[previewIndex]?.number}
                  </p>
                  <div className="text-xs text-gray-500">
                    This coupon has been exported as an SVG file.
                    All number variables have been replaced with the generated sequence.
                  </div>
                </div>
                {/* SVG Preview */}
                {generatedCoupons[previewIndex]?.svgContent && (
                  <div
                    className="mt-4 flex justify-center items-center bg-gray-100 p-4 rounded"
                    style={{ minHeight: 200, minWidth: 400, maxHeight: 300, overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: generatedCoupons[previewIndex].svgContent }}
                  />
                )}
              </div>

              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {generatedCoupons.slice(0, 50).map((coupon, index) => (
                    <div
                      key={coupon.id}
                      className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${
                        index === previewIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setPreviewIndex(index)}
                    >
                      <span className="font-mono text-sm">{coupon.number}</span>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  {generatedCoupons.length > 50 && (
                    <div className="p-3 text-center text-sm text-gray-500">
                      ... and {generatedCoupons.length - 50} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberGenerator;