import React, { useMemo } from 'react';
import { THU, pad } from '../constants';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const dateString = useMemo(() => {
    const now = new Date();
    return `${THU[now.getDay()]}, ${pad(now.getDate())}/${pad(
      now.getMonth() + 1
    )}/${now.getFullYear()} · ngày giờ tự ghi`;
  }, []);

  return (
    <header className="top">
      <div className="flex items-center justify-between">
        <div className="brandrow">
          {/* Logo Sơn Thăng Long & Ta Laa */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo Sơn Thăng Long"
              className="h-[52px] w-auto object-contain"
              onError={(e) => {
                // If logo.png fails to load, replace with clean brand SVG badge
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-[20px] tracking-tight leading-none text-[#0B6B5C] dark:text-[#3DB39D]">
                SƠN THĂNG LONG
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                Khẳng định CHẤT
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-muted hover:text-ink hover:bg-[var(--line)]/30 transition-colors"
          title="Cài đặt kết nối"
          aria-label="Cài đặt kết nối"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <h1 className="text-[26px] font-bold m-0 leading-tight">Báo cáo thăm đại lý</h1>
      <span className="when">{dateString}</span>
    </header>
  );
};
