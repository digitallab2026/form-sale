import React, { useEffect, useRef } from 'react';
import { getTodayQuote } from '../constants';

export const DailyQuote: React.FC = () => {
  const quote = getTodayQuote();
  const runRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!runRef.current) return;
    const firstSpan = runRef.current.querySelector('span');
    if (firstSpan) {
      const w = firstSpan.getBoundingClientRect().width;
      const duration = Math.max(10, w / 45);
      runRef.current.style.setProperty('--dur', `${duration}s`);
      runRef.current.classList.add('moving');
    }
  }, [quote]);

  return (
    <div className="quote" aria-label="Câu nói hôm nay">
      <span className="quote-tag">Hôm nay</span>
      <div className="quote-track">
        <div className="quote-run" ref={runRef}>
          <span>“{quote}”</span>
          <span aria-hidden="true">“{quote}”</span>
        </div>
      </div>
    </div>
  );
};
