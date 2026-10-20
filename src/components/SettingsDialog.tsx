import React, { useState, useEffect } from 'react';
import { getSheetUrl, saveSheetUrl } from '../services/storage';
import { testConnection, validateSheetUrl } from '../services/api';
import {
  X,
  Database,
  Check,
  Copy,
  AlertTriangle,
  Send,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  queueCount: number;
  onFlushQueue?: () => void;
}

const SPREADSHEET_ID = '1BtTjvAREAC8zzBnDK-hp5U_4lCF1VQYi_BGU08LqzzM';

const APPS_SCRIPT_CODE = `// ==========================================
// MÃ APPS SCRIPT CHO BÁO CÁO ĐẠI LÝ SƠN THĂNG LONG
// ==========================================
var SPREADSHEET_ID = "${SPREADSHEET_ID}";

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Mở bảng tính theo ID hoặc bảng tính hiện tại
    var ss;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (err) {}
    if (!ss) {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    }

    // Tự động tìm tab 'BaoCao' hoặc 'Trang tính1'
    var sheet = ss.getSheetByName("BaoCao") || ss.getSheetByName("Trang tính1") || ss.getSheets()[0];

    // Tạo tiêu đề nếu trang tính còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời gian", "Ngày", "Nhân viên", "Tên đại lý", 
        "Khu vực", "Số điện thoại", "Hãng sơn đang bán", 
        "Kết quả", "Ghi chú", "Mã báo cáo"
      ]);
    }

    // Thêm dòng dữ liệu mới
    sheet.appendRow([
      data.at ? new Date(data.at) : new Date(),
      data.ngay || "",
      data.nhan_vien || "",
      data.dai_ly || "",
      data.khu_vuc || "",
      data.sdt || "",
      data.hang_dang_ban || "",
      data.ket_qua || "",
      data.ghi_chu || "",
      data.id || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ 
      ok: true, 
      message: "Đã ghi thành công vào tab: " + sheet.getName(),
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      ok: false, 
      error: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    ok: true, 
    status: "Web App báo cáo STL hoạt động tốt!" 
  })).setMimeType(ContentService.MimeType.JSON);
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
  const [showScript, setShowScript] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setUrl(getSheetUrl());
      setSaved(false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validation = validateSheetUrl(url);
  const isSheetLink = url.includes('docs.google.com/spreadsheets');

  const handleSave = () => {
    if (!validation.valid) {
      setTestResult({
        ok: false,
        message: validation.error || 'Link không hợp lệ.',
      });
      return;
    }

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
        className="dlg-box max-w-lg max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" />
            <h2 id="settingsTitle" className="text-[19px] font-bold m-0">
              Cấu hình liên kết Google Sheet
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

        {/* Warning if user pasted docs.google.com link */}
        {isSheetLink && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <strong>Chú ý quan trọng:</strong> Link bạn vừa dán là link trang tính Google Sheets (<code>docs.google.com</code>). 
              Google Sheet không thể trực tiếp nhận dữ liệu từ bên ngoài mà <strong>bắt buộc phải qua Google Apps Script Web App</strong> (link có đuôi <code>/exec</code>). 
              Hãy xem hướng dẫn tạo Web App phía dưới!
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="sheetUrl" className="text-sm font-semibold text-ink">
            Link Web App Google Apps Script (đuôi /exec):
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
            className={`text-sm font-mono ${isSheetLink ? '!border-red-500 !bg-red-50/50' : ''}`}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url.trim()}
              className="chip !min-h-[38px] !text-xs !py-1 !px-3 font-medium flex items-center gap-1.5"
            >
              {testing ? 'Đang gửi thử sang Sheet…' : 'Gửi 1 dòng kiểm tra sang Sheet'}
            </button>
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="text-xs text-accent underline py-1 px-2 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showScript ? 'Thu gọn hướng dẫn' : 'Xem hướng dẫn & mã Script'}
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed border ${
              testResult.ok
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
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
                <Send className="w-3 h-3" /> Gửi lại tất cả
              </button>
            )}
          </div>
        )}

        {/* Detailed Guide & Code with User's Exact Sheet ID */}
        {showScript && (
          <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                Mã Apps Script (Đã tối ưu cho bảng tính của bạn):
              </span>
              <button
                type="button"
                onClick={copyScript}
                className="text-xs text-accent font-semibold inline-flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-[var(--line)] hover:bg-[var(--line)]/20"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Sao chép mã
                  </>
                )}
              </button>
            </div>

            <pre className="text-[11px] font-mono p-2.5 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto max-h-36 select-all">
              {APPS_SCRIPT_CODE}
            </pre>

            <div className="text-xs text-muted space-y-1.5 pt-1">
              <div className="font-semibold text-ink">Các bước làm trong 1 phút:</div>
              <ol className="list-decimal pl-4 space-y-1 text-ink/80">
                <li>
                  Trên Google Sheet của bạn, vào menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                </li>
                <li>
                  Xoá toàn bộ nội dung cũ trong cửa sổ Apps Script, dán đoạn mã bên trên vào rồi nhấn <strong>Lưu</strong> (Ctrl + S).
                </li>
                <li>
                  Nhấn nút xanh <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &gt; chọn <strong>Tùy chọn triển khai mới (New deployment)</strong>.
                </li>
                <li>
                  Bấm vào biểu tượng bánh răng ⚙️ bên cạnh 'Chọn loại' &gt; chọn <strong>Ứng dụng web (Web App)</strong>.
                </li>
                <li>
                  <strong>Cực kỳ quan trọng:</strong> Ở mục <em>Ai có quyền truy cập (Who has access)</em>, chọn <strong>Bất kỳ ai (Anyone)</strong>.
                </li>
                <li>
                  Nhấn <strong>Triển khai (Deploy)</strong> &gt; Cấp quyền (Authorize access) &gt; Sao chép link Web App (kết thúc bằng <code>/exec</code>) dán vào ô bên trên.
                </li>
              </ol>
              <div className="text-[11px] text-amber-700 dark:text-amber-300 italic pt-1">
                * Gợi ý: Dữ liệu sẽ tự động ghi vào tab <strong>BaoCao</strong> hoặc <strong>Trang tính1</strong> của bạn.
              </div>
            </div>
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
            Tài liệu Google Web App <ExternalLink className="w-3 h-3" />
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
