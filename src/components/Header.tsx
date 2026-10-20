import React, { useMemo } from 'react';
import { THU, pad } from '../constants';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const dateString = useMemo(() => {
    const now = new Date();
    return `${THU[now.getDay()]}, ${pad(now.getDate())}/${pad(
      now.getMonth() + 1
    )}/${now.getFullYear()} · ngày giờ tự ghi`;
  }, []);

  return (
    <header className="top">
      <div className="flex items-center justify-between gap-3">
        {/* Logo Sơn Thăng Long (bên trái) */}
        <div className="brandrow flex items-center">
          <img
            src="/logo.png"
            alt="Logo Sơn Thăng Long"
            className="h-[52px] sm:h-[56px] w-auto object-contain"
          />
        </div>

        {/* Ảnh nhân vật đặt ở vị trí góc phải màn hình, cùng hàng với biểu tượng logo */}
        <div className="flex items-center justify-end flex-shrink-0">
          <img
            src="/talaa.png"
            alt="Ta Laa - Sơn Thăng Long"
            className="h-[64px] sm:h-[72px] w-auto object-contain drop-shadow-sm select-none pointer-events-none"
            onError={(e) => {
              // Fallback trực tiếp đến link gốc nếu cần
              (e.target as HTMLImageElement).src =
                'https://i.pinimg.com/originals/dd/49/2b/dd492bfff6bc4455c3ed6c0198414d16.png';
            }}
          />
        </div>
      </div>

      <h1 className="text-[26px] font-bold m-0 leading-tight">Báo cáo thăm đại lý</h1>
      <span className="when">{dateString}</span>
    </header>
  );
};
