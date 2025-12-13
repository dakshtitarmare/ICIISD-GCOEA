import { useCallback, useState, useRef } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: Error) => void;
}

/**
 * QR Scanner component using HTML5 getUserMedia API
 * This is a fallback for when react-qr-reader is not available
 */
export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCameraPermission('pending');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setCameraPermission('granted');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Camera permission denied or not available';
      setError(errorMsg);
      setCameraPermission('denied');
      onError?.(new Error(errorMsg));
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsScanning(false);
    }
  }, []);

  // Decode QR from video frame (simple implementation)
  const decodeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // In a real app, you'd use a QR code library like jsQR
      // For now, this is a placeholder that shows the scanner interface
      if (isScanning) {
        requestAnimationFrame(decodeFrame);
      }
    } catch (err) {
      console.error('Frame decode error:', err);
    }
  }, [isScanning]);

  // Handle manual QR code input
  const handleManualInput = (qrData: string) => {
    if (qrData.trim()) {
      onScan(qrData);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Camera Permission Status */}
      {cameraPermission === 'pending' && !isScanning && (
        <button
          onClick={startCamera}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Enable Camera for QR Scan
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Camera Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Video Feed */}
      {isScanning && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto"
          />

          {/* QR Code Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-green-400 rounded-lg opacity-50" />
          </div>

          {/* Loading Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>

          {/* Stop Button */}
          <button
            onClick={stopCamera}
            className="absolute bottom-4 left-4 right-4 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Stop Camera
          </button>
        </div>
      )}

      {/* Canvas for processing (hidden) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Manual QR Code Input */}
      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Or enter QR code manually
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste QR code data here"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualInput(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
          <button
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
              handleManualInput(input.value);
              input.value = '';
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
