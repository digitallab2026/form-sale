import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PendingBannerProps {
  count: number;
  isFlushing: boolean;
  onRetry: () => void;
}

export const PendingBanner: React.FC<PendingBannerProps> = ({
  count,
  isFlushing,
  onRetry,
}) => {
  if (count <= 0) return null;

  return (
    <div className="pending">
      <span>{count} báo cáo chưa gửi được do mất mạng.</span>
      <button
        className="link inline-flex items-center gap-1 font-semibold"
        type="button"
        onClick={onRetry}
        disabled={isFlushing}
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin' : ''}`} />
        {isFlushing ? 'Đang gửi…' : 'Gửi lại'}
      </button>
    </div>
  );
};
