import { ReportDoc } from '../types';
import { getSheetUrl } from './storage';

export function validateSheetUrl(url: string): { valid: boolean; error?: string } {
  const trimmed = (url || '').trim();
  if (!trimmed || trimmed === 'DAN_LINK_APPS_SCRIPT_VAO_DAY') {
    return {
      valid: false,
      error: 'Chưa cấu hình liên kết Google Apps Script Web App.',
    };
  }

  if (trimmed.includes('docs.google.com/spreadsheets')) {
    return {
      valid: false,
      error:
        'Bạn đang dán link trang tính Google Sheets (docs.google.com). Đây không phải link Web App. Bạn cần dán link Web App của Google Apps Script (dạng https://script.google.com/macros/s/.../exec).',
    };
  }

  if (!trimmed.startsWith('https://script.google.com/macros/s/')) {
    return {
      valid: false,
      error:
        'Link không đúng định dạng. Link Web App Google Apps Script phải bắt đầu bằng https://script.google.com/macros/s/...',
    };
  }

  if (trimmed.endsWith('/edit')) {
    return {
      valid: false,
      error:
        'Link của bạn đang kết thúc bằng /edit. Link Web App sau khi Triển khai (Deploy) phải kết thúc bằng /exec.',
    };
  }

  return { valid: true };
}

export async function sendReport(doc: ReportDoc): Promise<boolean> {
  const sheetUrl = getSheetUrl();
  const validation = validateSheetUrl(sheetUrl);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(doc),
    });

    // Check if JSON response is readable
    try {
      const data = await response.json();
      if (data && data.ok === false) {
        throw new Error(data.error || 'Google Apps Script báo lỗi');
      }
      return true;
    } catch {
      // If response body is not JSON or opaque due to redirect
      if (response.ok || response.status === 200 || response.type === 'opaque') {
        return true;
      }
      throw new Error(`Google Apps Script trả về mã lỗi HTTP: ${response.status}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Google Apps Script báo lỗi') || message.includes('HTTP:')) {
      throw err;
    }

    // Attempt fallback with text/plain
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(doc),
      });
      return true;
    } catch {
      throw new Error(
        'Không thể gửi đến Google Apps Script. Vui lòng kiểm tra lại quyền truy cập "Anyone" của Web App.'
      );
    }
  }
}

export async function testConnection(url: string): Promise<{
  ok: boolean;
  message: string;
  details?: string;
}> {
  const validation = validateSheetUrl(url);
  if (!validation.valid) {
    return {
      ok: false,
      message: validation.error || 'Link không hợp lệ',
    };
  }

  const testPayload: ReportDoc = {
    id: 'test_' + Date.now().toString(36),
    at: new Date().toISOString(),
    ngay: new Date().toISOString().slice(0, 10),
    nhan_vien: 'Kiểm tra hệ thống',
    dai_ly: 'Đại lý Test Kết Nối',
    khu_vuc: 'Hà Nội',
    sdt: '0988888888',
    hang_dang_ban: 'Sơn Thăng Long',
    ket_qua: 'Kiểm tra thành công',
    ghi_chu: 'Dòng kiểm tra tự động - nếu bạn thấy dòng này thì kết nối đã chuẩn xác 100%!',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(testPayload),
    });

    try {
      const data = await response.json();
      if (data && data.ok) {
        return {
          ok: true,
          message:
            data.message ||
            'Kết nối thành công! Đã ghi 1 dòng kiểm tra vào Google Sheet.',
        };
      } else if (data && data.ok === false) {
        return {
          ok: false,
          message: 'Apps Script báo lỗi: ' + (data.error || 'Không xác định'),
        };
      }
    } catch {
      // JSON parse failed, check status
    }

    if (response.ok || response.status === 200) {
      return {
        ok: true,
        message:
          'Đã gửi thành công dữ liệu kiểm tra! Hãy mở Google Sheet (kiểm tra cả tab Trang tính1 và tab BaoCao) để xem dòng mới.',
      };
    }

    return {
      ok: false,
      message: `Google trả về mã phản hồi ${response.status}. Hãy kiểm tra xem bạn đã chọn 'Anyone' khi triển khai Web App chưa.`,
    };
  } catch (err: unknown) {
    // If standard fetch failed, try to diagnose
    try {
      // Test GET request
      const getRes = await fetch(url, { method: 'GET' });
      if (getRes.redirected && getRes.url.includes('accounts.google.com')) {
        return {
          ok: false,
          message:
            'Web App đang yêu cầu đăng nhập tài khoản Google. Bạn cần vào Apps Script > Triển khai lại > mục "Ai có quyền truy cập (Who has access)" phải chọn: "Bất kỳ ai (Anyone)".',
        };
      }
    } catch {
      // Ignore GET error
    }

    return {
      ok: false,
      message:
        'Lỗi kết nối: ' +
        (err instanceof Error ? err.message : String(err)) +
        '. Vui lòng kiểm tra lại link Web App và quyền "Anyone".',
    };
  }
}
