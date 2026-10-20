import React from 'react';

interface SuccessViewProps {
  isSent: boolean;
  dealerName: string;
  timeString: string;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  isSent,
  dealerName,
  timeString,
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
        {isSent ? 'Đã lưu' : 'Đã lưu trên máy'}
      </h2>
      <p className="m-0 text-muted">
        {dealerName} · {timeString}
        {!isSent && '. Mạng yếu nên chưa gửi được, máy sẽ tự gửi lại khi có mạng.'}
      </p>
    </section>
  );
};
