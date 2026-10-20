import React from 'react';
import { Database } from 'lucide-react';

interface SuccessViewProps {
  isSent: boolean;
  dealerName: string;
  timeString: string;
  hasSheetConfigured?: boolean;
  onOpenSettings?: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  isSent,
  dealerName,
  timeString,
  hasSheetConfigured = true,
  onOpenSettings,
}) => {
  return (
    <section className="done">
      <div className="tick">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 className="text-[22px] font-bold m-0">
        {isSent ? 'Đã lưu sang Google Sheet' : 'Đã lưu trên máy'}
      </h2>
      <p className="m-0 text-muted max-w-sm text-center">
        {dealerName} · {timeString}
        {!isSent && !hasSheetConfigured && (
          <span className="block mt-1 text-bad font-medium">
            Chưa có link Google Sheet nên dữ liệu chưa được gửi đi.
          </span>
        )}
        {!isSent && hasSheetConfigured && (
          <span className="block mt-1">
            . Mạng yếu nên chưa gửi được, máy sẽ tự gửi lại khi có mạng.
          </span>
        )}
      </p>

      {!hasSheetConfigured && onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-accent-ink inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          <Database className="w-3.5 h-3.5" /> Cài đặt liên kết Google Sheet
        </button>
      )}
    </section>
  );
};
