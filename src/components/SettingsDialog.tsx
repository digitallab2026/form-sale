import React, { useState, useEffect } from 'react';
import { getSheetUrl, saveSheetUrl } from '../services/storage';
import { X, ExternalLink, Database, Check } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queueCount: number;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  queueCount,
}) => {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(getSheetUrl());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSheetUrl(url.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="dlg">
      <div
        className="dlg-box max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <h2 id="settingsTitle" className="text-[19px] font-bold m-0">
              Cài đặt kết nối Google Sheet
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-[var(--line)]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="hint text-muted m-0 text-sm leading-normal">
          Dán link Web App của Google Apps Script (triển khai dạng Web App cho phép 'Anyone' truy cập) để tự động lưu báo cáo trực tiếp về Google Sheets của công ty.
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="sheetUrl" className="text-sm font-semibold text-ink">
            Link Web App Google Apps Script:
          </label>
          <input
            id="sheetUrl"
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-base font-mono"
          />
        </div>

        {queueCount > 0 && (
          <div className="p-3 rounded-xl bg-[var(--warn-soft)] text-sm flex items-center justify-between text-ink">
            <span>Đang có {queueCount} báo cáo trong hàng chờ lưu máy.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <a
            href="https://developers.google.com/apps-script/guides/web"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent underline flex items-center gap-1"
          >
            Hướng dẫn Google Apps Script <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="chip !min-h-[44px] !text-sm"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="save !w-auto !min-h-[44px] !px-5 !text-sm !font-semibold inline-flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Đã lưu
                </>
              ) : (
                'Lưu cấu hình'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
