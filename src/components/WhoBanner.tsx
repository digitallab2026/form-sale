import React from 'react';

interface WhoBannerProps {
  name: string;
  onChangeName: () => void;
}

export const WhoBanner: React.FC<WhoBannerProps> = ({ name, onChangeName }) => {
  if (!name) return null;

  return (
    <div className="who">
      <span>
        Người báo cáo: <b>{name}</b>
      </span>
      <button className="link" type="button" onClick={onChangeName}>
        Đổi tên
      </button>
    </div>
  );
};
