'use client';

import { useState, useEffect } from 'react';

export function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
      setDate(now.toLocaleDateString('ru-RU', { day:'2-digit', month:'short' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="hidden lg:flex flex-col items-end leading-tight">
      <span className="text-xs font-mono text-white font-bold opacity-90">{time}</span>
      <span className="text-xs text-blue-300 opacity-60">{date}</span>
    </div>
  );
}
