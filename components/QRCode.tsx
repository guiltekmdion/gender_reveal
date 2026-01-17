'use client';

import React from 'react';
import QRCodeSVG from 'react-qr-code';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  if (!value) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg">
        <div className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]">
          <QRCodeSVG
            value={value}
            size={size}
            level="M"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
