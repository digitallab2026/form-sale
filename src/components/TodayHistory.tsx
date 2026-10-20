import React, { useState } from 'react';
import { ReportDoc } from '../types';
import { formatTime } from '../constants';
import { ChevronDown, ChevronUp, Copy, Check, Phone, MapPin, Tag } from 'lucide-react';

interface TodayHistoryProps {
  items: ReportDoc[];
  queue: ReportDoc[];
}

export const TodayHistory: React.FC<TodayHistoryProps> = ({ items, queue }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sort descending by time
  const sortedItems = [...items].sort((a, b) => (a.at < b.at ? 1 : -1));
  const queueIds = new Set(queue.map((q) => q.id));

  const copySummary = () => {
    if (!sortedItems.length) return;
    const text = sortedItems
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.dai_ly}${it.khu_vuc ? ` (${it.khu_vuc})` : ''} - ${it.ket_qua || 'Chưa phân loại'}${
            it.sdt ? ` [${it.sdt}]` : ''
          }${it.ghi_chu ? ` | ${it.ghi_chu}` : ''}`
      )
      .join('\n');

    navigator.clipboard.writeText(`BÁO CÁO THĂM ĐẠI LÝ HÔM NAY (${sortedItems.length} đại lý):\n` + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="today">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[17px] font-bold m-0">
          Hôm nay bạn đã nhập {sortedItems.length ? `(${sortedItems.length} đại lý)` : ''}
        </h2>
        {sortedItems.length > 0 && (
          <button
            type="button"
            onClick={copySummary}
            className="text-xs font-semibold text-accent inline-flex items-center gap-1 hover:underline py-1 px-2 rounded-lg bg-[var(--line)]/20"
            title="Sao chép danh sách hôm nay"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent" /> Đã sao chép
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Sao chép báo cáo
              </>
            )}
          </button>
        )}
      </div>

      {sortedItems.length === 0 ? (
        <p className="empty" id="todayEmpty">
          Chưa có đại lý nào. Nhập đại lý đầu tiên ở trên rồi bấm Lưu.
        </p>
      ) : (
        <ul id="todayList">
          {sortedItems.map((doc) => {
            const isWaiting = queueIds.has(doc.id);
            const isExpanded = expandedId === doc.id;

            return (
              <li
                key={doc.id}
                onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                className="cursor-pointer transition-colors hover:border-accent/40 flex-col !items-stretch"
              >
                <div className="flex justify-between items-start gap-[10px] w-full">
                  <div className="n flex-1">
                    <div className="flex items-center gap-1.5">
                      <span>{doc.dai_ly}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted inline flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted inline flex-shrink-0" />
                      )}
                    </div>
                    {doc.ket_qua && <div className="s">{doc.ket_qua}</div>}
                  </div>
                  <div className="t">
                    <span>{formatTime(doc.at)}</span>
                    {isWaiting && <span className="wait">chờ gửi</span>}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--line)] text-sm text-ink/80 flex flex-col gap-1.5 animate-fadeIn">
                    {doc.khu_vuc && (
                      <div className="flex items-center gap-2 text-muted">
                        <MapPin className="w-3.5 h-3.5 flex-none text-accent" />
                        <span>Khu vực: <strong className="text-ink">{doc.khu_vuc}</strong></span>
                      </div>
                    )}
                    {doc.sdt && (
                      <div className="flex items-center gap-2 text-muted">
                        <Phone className="w-3.5 h-3.5 flex-none text-accent" />
                        <span>SĐT: <a href={`tel:${doc.sdt}`} className="text-accent underline font-medium">{doc.sdt}</a></span>
                      </div>
                    )}
                    {doc.hang_dang_ban && (
                      <div className="flex items-start gap-2 text-muted">
                        <Tag className="w-3.5 h-3.5 flex-none text-accent mt-0.5" />
                        <span>Sơn đang bán: <strong className="text-ink">{doc.hang_dang_ban}</strong></span>
                      </div>
                    )}
                    {doc.ghi_chu && (
                      <div className="mt-1 p-2 bg-[var(--bg)] rounded-lg text-xs leading-relaxed italic text-ink/90 border border-[var(--line)]">
                        "{doc.ghi_chu}"
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
