'use client';

import { useEffect, useState } from 'react';

interface LockCountdownProps {
  remainingMs: number;
  onExpire?: () => void;
}

export default function LockCountdown({ remainingMs, onExpire }: LockCountdownProps) {
  const [displayTime, setDisplayTime] = useState(remainingMs);

  useEffect(() => {
    setDisplayTime(remainingMs);
    
    if (remainingMs <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingMs, onExpire]);

  const minutes = Math.floor(displayTime / 60000);
  const seconds = Math.floor((displayTime % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isLow = displayTime < 30000; // Less than 30 seconds

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-md ${isLow ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
      <div className="text-sm font-medium">Lock expires in:</div>
      <div className={`text-lg font-bold font-mono ${isLow ? 'text-red-600' : 'text-blue-600'}`}>
        {formattedTime}
      </div>
    </div>
  );
}

