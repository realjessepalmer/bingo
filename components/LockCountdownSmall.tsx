'use client';

import { useEffect, useState } from 'react';

interface LockCountdownSmallProps {
  remainingMs: number;
}

export default function LockCountdownSmall({ remainingMs }: LockCountdownSmallProps) {
  const [displayTime, setDisplayTime] = useState(remainingMs);

  useEffect(() => {
    setDisplayTime(remainingMs);
    
    if (remainingMs <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingMs]);

  const minutes = Math.floor(displayTime / 60000);
  const seconds = Math.floor((displayTime % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="text-xs text-center mt-1 text-gray-600 font-mono">
      🔒 Available in {formattedTime}
    </div>
  );
}

