import React, { useState, useEffect } from 'react';
import { X, Hash, FileText, Link as LinkIcon, Unlink } from 'lucide-react';

interface NumberGeneratorProps {
  onClose: () => void;
  onGenerate: (
    startNumber: number,
    count: number,
    prefix: string,
    numberLength: number,
    format: 'svg' | 'png' | 'jpg',
    resolution?: { width: number, height: number }
  ) => Promise<any[]>;
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

const DEFAULT_ASPECT_RATIO = 1; // fallback for initial state

const NumberGenerator: React.FC<NumberGeneratorProps> = ({
  onClose,
  onGenerate,
  onExport,
}) => {
  const [startNumberStr, setStartNumberStr] = useState('001');
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState('');
  const [numberLength, setNumberLength] = useState(getNumberLength('001'));
  const [generatedCoupons, setGeneratedCoupons] = useState<any[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [format, setFormat] = useState<'svg' | 'png' | 'jpg'>('svg');

  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(580);
  const [linked, setLinked] = useState(true);
  const [svgAspectRatio, setSvgAspectRatio] = useState<number>(DEFAULT_ASPECT_RATIO);

  const [loading, setLoading] = useState(false); // Nana: Loading state

  // Detect aspect ratio from SVG after generation
  useEffect(() => {
    if (
      generatedCoupons.length > 0 &&
      generatedCoupons[0].svgContent
    ) {
      const match = generatedCoupons[0].svgContent.match(/viewBox="([\d.\s]+)"/);
      if (match) {
        const [, viewBoxStr] = match;
        const [x, y, w, h] = viewBoxStr.split(' ').map(parseFloat);
        const aspect = h !== 0 ? w / h : DEFAULT_ASPECT_RATIO;
        setSvgAspectRatio(aspect);
        if (linked) {
          setHeight(Math.round(width / aspect));
        }
      }
    }
  }, [generatedCoupons, linked, width]);

  // Whenever format changes, sync resolution based on aspect ratio
  useEffect(() => {
    if (format !== 'svg') {
      if (!svgAspectRatio || svgAspectRatio === 0) {
        setSvgAspectRatio(DEFAULT_ASPECT_RATIO);
      }
      if (linked) {
        setHeight(Math.round(width / svgAspectRatio));
      }
    }
  }, [format, linked, width, svgAspectRatio]);

  const handleStartNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, '');
    setStartNumberStr(val);
    setNumberLength(val.length || 1);
  };

  const handleGenerate = async () => {
    setLoading(true); // Nana: Start loading
    try {
      const startNumber = parseInt(startNumberStr, 10) || 0;
      const resolution = format !== 'svg' ? { width, height } : undefined;
      const coupons = await onGenerate(startNumber, count, prefix, numberLength, format, resolution);
      setGeneratedCoupons(coupons);
      setPreviewIndex(0);
      // Nana: Don't reset width/height here!
      await onExport(coupons); // Nana: Export after generating
    } catch (error) {
      // Nana: For the master, show a toast or error here if you want
      // (You can add error handling if you want)
    } finally {
      setLoading(false); // Nana: Stop loading
    }
  };

  // Width/height sync logic
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Math.max(100, parseInt(e.target.value) || 100);
    setWidth(newWidth);
    if (linked && svgAspectRatio) {
      setHeight(Math.round(newWidth / svgAspectRatio));
    }
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Math.max(100, parseInt(e.target.value) || 100);
    setHeight(newHeight);
    if (linked && svgAspectRatio) {
      setWidth(Math.round(newHeight * svgAspectRatio));
    }
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Number</label>
                <input
                  type="text"
                  value={startNumberStr}
                  onChange={handleStartNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                  placeholder="e.g., 001"
                  maxLength={10}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number Length</label>
                <input
                  type="number"
                  value={numberLength}
                  onChange={e => setNumberLength(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min={1}
                  max={10}
                  disabled={loading}
                />
                <div className="text-xs text-gray-500 mt-1">
                  How many digits (e.g. 3 → "001", 4 → "0001")
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Count</label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min={1}
                  max={10000}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prefix (Optional)</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., COUP-"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as 'svg' | 'png' | 'jpg')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={loading}
                >
                  <option value="svg">SVG</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>

              {/* Resolution inputs if not SVG */}
              {format !== 'svg' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (px)</label>
                    <input
                      type="number"
                      value={width}
                      min={100}
                      max={5000}
                      onChange={handleWidthChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (px)</label>
                    <input
                      type="number"
                      value={height}
                      min={100}
                      max={5000}
                      onChange={handleHeightChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center mt-6 gap-2">
                    <button
                      onClick={() => setLinked(!linked)}
                      className="p-2 border rounded hover:bg-gray-100"
                      disabled={loading}
                    >
                      {linked ? <LinkIcon className="text-blue-600 w-4 h-4" /> : <Unlink className="text-gray-500 w-4 h-4" />}
                    </button>
                    <span className="text-xs text-gray-700">{linked ? ' Aspect Ratio Locked' : 'Free Resize'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Number Format Preview */}
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

            {/* Loading bar or Generate button */}
            <div>
              {loading ? (
                <div className="w-full flex items-center justify-center gap-2 px-4 py-3">
                  <div className="w-full h-3 bg-gray-200 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-purple-600 transition-all animate-pulse-loading"
                      style={{ width: '60%' }} // Nana: You can animate or increase width for progress effect
                    />
                  </div>
                  <span className="ml-2 text-purple-600 font-medium">exporting...</span>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Hash className="w-4 h-4" />
                  Generate & Export {count} Coupons
                </button>
              )}
            </div>
            <style>
              {`
              @keyframes pulse-loading {
                0% { width: 20%; }
                50% { width: 80%; }
                100% { width: 60%; }
              }
              .animate-pulse-loading {
                animation: pulse-loading 1.5s infinite;
              }
              `}
            </style>
          </div>

          {/* Coupon Preview Section */}
          {generatedCoupons.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Exported Coupons ({generatedCoupons.length})
                </h3>
                <div className="text-sm text-green-600 font-medium">✓ ZIP file downloaded</div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-600">Preview: {previewIndex + 1} of {generatedCoupons.length}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                    disabled={previewIndex === 0}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPreviewIndex(Math.min(generatedCoupons.length - 1, previewIndex + 1))}
                    disabled={previewIndex === generatedCoupons.length - 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
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
                    This coupon has been exported as {format.toUpperCase()} file.
                  </div>
                </div>
                {generatedCoupons[previewIndex]?.svgContent && format === 'svg' && (
                  <div
                    className="mt-4 flex justify-center items-center bg-gray-100 p-4 rounded"
                    style={{ minHeight: 200, minWidth: 400, maxHeight: 300, overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: generatedCoupons[previewIndex].svgContent }}
                  />
                )}
                {generatedCoupons[previewIndex]?.imgData && format !== 'svg' && (
                  <div
                    className="mt-4 flex justify-center items-center bg-gray-100 p-4 rounded"
                    style={{ minHeight: 200, minWidth: 400, maxHeight: 300, overflow: 'auto' }}
                  >
                    <img
                      src={generatedCoupons[previewIndex].imgData}
                      alt={generatedCoupons[previewIndex].number}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>
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