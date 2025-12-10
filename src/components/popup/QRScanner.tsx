import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { useAccounts } from '../../store';

interface QRScannerProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function QRScanner({ onClose, onSuccess }: QRScannerProps) {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useAccounts();

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const parseOtpAuthUrl = (url: string) => {
    try {
      const urlObj = new URL(url);

      if (urlObj.protocol !== 'otpauth:') {
        throw new Error('不是有效的 OTP Auth URL');
      }

      const type = urlObj.host; // totp or hotp
      const label = decodeURIComponent(urlObj.pathname.substring(1));
      const params = new URLSearchParams(urlObj.search);

      let issuer = params.get('issuer') || '';
      let account = '';

      // Parse label (format: issuer:account or just account)
      if (label.includes(':')) {
        const parts = label.split(':');
        if (!issuer) issuer = parts[0];
        account = parts[1] || '';
      } else {
        account = label;
      }

      const secret = params.get('secret');
      if (!secret) {
        throw new Error('二维码中未找到密钥');
      }

      const period = parseInt(params.get('period') || '30');
      const digits = parseInt(params.get('digits') || '6');
      const algorithm = params.get('algorithm')?.toUpperCase() || 'SHA1';

      return {
        type: type === 'hotp' ? 2 : 1, // 1=TOTP, 2=HOTP
        issuer,
        account,
        secret: secret.toUpperCase(),
        period,
        digits,
        algorithm: algorithm === 'SHA256' ? 2 : algorithm === 'SHA512' ? 3 : 1,
        counter: parseInt(params.get('counter') || '0'),
      };
    } catch (err) {
      throw new Error('无法解析二维码: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleQRCodeDetected = (qrData: string) => {
    try {
      const accountData = parseOtpAuthUrl(qrData);

      dispatch({
        type: 'addCode',
        payload: accountData
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '扫描失败');
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanFromVideo();
      }
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setScanning(false);
  };

  const scanFromVideo = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFromVideo);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      stopCamera();
      handleQRCodeDetected(code.data);
    } else {
      requestAnimationFrame(scanFromVideo);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleQRCodeDetected(code.data);
        } else {
          setError('未能识别二维码，请确保图片清晰');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-content">
        <div className="scanner-header">
          <h2>扫描二维码</h2>
          <button className="close-btn" onClick={onClose} title="关闭">
            ✕
          </button>
        </div>

        <div className="scanner-body">
          {scanning ? (
            <div className="camera-preview">
              <video ref={videoRef} autoPlay playsInline />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button className="btn-stop-camera" onClick={stopCamera}>
                停止扫描
              </button>
            </div>
          ) : (
            <div className="scanner-options">
              <button className="btn-camera" onClick={startCamera}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                  <path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-8c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>
                </svg>
                打开摄像头扫描
              </button>

              <div className="divider">或</div>

              <button
                className="btn-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                上传二维码图片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
