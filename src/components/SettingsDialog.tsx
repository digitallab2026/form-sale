import React, { useState, useEffect } from 'react';
import { getSheetUrl, saveSheetUrl } from '../services/storage';
import { testConnection } from '../services/api';
import { X, ExternalLink, Database, Check, Copy, AlertTriangle, Send } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queueCount: number;
  onFlushQueue?: () => void;
}

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tạo tiêu đề cột ở dòng đầu tiên nếu trang tính trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian", "Ngày", "Nhân viên", "Tên đại lý", 
        "Khu vực", "Số điện thoại", "Hãng sơn đang bán", 
        "Kết quả", "Ghi chú", "Mã báo cáo"
      ]);
    }
    
    // Thêm dòng dữ liệu mới
    sheet.appendRow([
      new Date(data.at),
      data.ngay,
      data.nhan_vien,
      data.dai_ly,
      data.khu_vuc,
      data.sdt,
      data.hang_dang_ban,
      data.ket_qua,
      data.ghi_chu,
      data.id
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  queueCount,
  onFlushQueue,
}) => {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(getSheetUrl());
      setSaved(false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveSheetUrl(url.trim());
    setSaved(true);
    if (onFlushQueue && url.trim()) {
      onFlushQueue();
    }
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleTest = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setTestResult({
        ok: false,
        message: 'Vui lòng dán link Web App trước khi kiểm tra.',
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(trimmed);
    setTesting(false);
    setTestResult(res);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="dlg">
      <div
        className="dlg-box max-w-lg max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <h2 id="settingsTitle" className="text-[19px] font-bold m-0">
              Kết nối Google Sheet
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
          Để báo cáo tự động đổ về Google Sheet, bạn cần tạo một <strong>Google Apps Script Web App</strong> và dán đường link triển khai vào ô bên dưới.
        </p>

        <div className="flex flex-col gap-2">
          <label htmlFor="sheetUrl" className="text-sm font-semibold text-ink">
            Link Web App của Google Apps Script:
          </label>
          <input
            id="sheetUrl"
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setTestResult(null);
            }}
            className="text-sm font-mono"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url.trim()}
              className="chip !min-h-[38px] !text-xs !py-1 !px-3 font-medium flex items-center gap-1.5"
            >
              {testing ? 'Đang kiểm tra…' : 'Kiểm tra gửi thử sang Sheet'}
            </button>
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="text-xs text-accent underline py-1 px-2"
            >
              {showScript ? 'Ẩn mã Apps Script' : 'Xem mã Apps Script mẫu'}
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed border ${
              testResult.ok
                ? 'bg-accent-soft/50 text-[#0B6B5C] border-accent/30 dark:text-[#3DB39D]'
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
            }`}
          >
            <strong>{testResult.ok ? '✓ Thành công: ' : '✗ Lỗi: '}</strong>
            {testResult.message}
          </div>
        )}

        {/* Queue Notice & Flush Action */}
        {queueCount > 0 && (
          <div className="p-3 rounded-xl bg-[var(--warn-soft)] text-xs flex items-center justify-between gap-2 text-ink">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Đang có <strong>{queueCount} báo cáo</strong> lưu trên máy chưa gửi được.
            </span>
            {onFlushQueue && (
              <button
                type="button"
                onClick={onFlushQueue}
                className="text-xs font-semibold text-accent underline flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Gửi ngay
              </button>
            )}
          </div>
        )}

        {/* Apps Script Guide & Code */}
        {showScript && (
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink">Mã Apps Script (dán vào Google Sheet):</span>
              <button
                type="button"
                onClick={copyScript}
                className="text-xs text-accent font-semibold inline-flex items-center gap-1 bg-white dark:bg-neutral-800 px-2 py-1 rounded border border-[var(--line)]"
              >
                {copiedScript ? <><Check className="w-3 h-3" /> Đã sao chép</> : <><Copy className="w-3 h-3" /> Sao chép mã</>}
              </button>
            </div>
            <pre className="text-[11px] font-mono p-2 bg-neutral-900 text-neutral-100 rounded overflow-x-auto max-h-40">
              {APPS_SCRIPT_CODE}
            </pre>
            <ol className="text-xs text-muted list-decimal pl-4 space-y-1">
              <li>Mở Google Sheet &gt; <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Dán đoạn mã trên vào &gt; Nhấn <strong>Lưu</strong>.</li>
              <li>Nhấn <strong>Triển khai (Deploy)</strong> &gt; <strong>Tùy chọn triển khai mới (New deployment)</strong>.</li>
              <li>Chọn loại: <strong>Ứng dụng web (Web App)</strong>.</li>
              <li>Mục <em>Ai có quyền truy cập (Who has access)</em> chọn: <strong>Bất kỳ ai (Anyone)</strong>.</li>
              <li>Sao chép link Web App (dạng <code className="text-xs">.../exec</code>) dán vào ô bên trên.</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
          <a
            href="https://developers.google.com/apps-script/guides/web"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent underline flex items-center gap-1"
          >
            Tài liệu Google <ExternalLink className="w-3 h-3" />
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
