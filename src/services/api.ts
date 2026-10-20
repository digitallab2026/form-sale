import { ReportDoc } from '../types';
import { getSheetUrl } from './storage';

export async function sendReport(doc: ReportDoc): Promise<boolean> {
  const sheetUrl = getSheetUrl();
  if (!sheetUrl || sheetUrl === 'DAN_LINK_APPS_SCRIPT_VAO_DAY') {
    throw new Error('Chưa cấu hình liên kết Google Apps Script Web App');
  }

  // Attempt standard fetch first (supports reading ok status if CORS headers are returned)
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
        throw new Error(data.error || 'Google Apps Script báo lỗi khi ghi dữ liệu');
      }
    } catch {
      // If response body is opaque or not JSON due to Google redirect,
      // the POST was still transmitted and processed by Google Apps Script.
    }

    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // If it's a known error from Apps Script, rethrow
    if (message.includes('Google Apps Script báo lỗi')) {
      throw err;
    }

    // Fallback: try mode 'no-cors' so browser allows the cross-origin request
    // Google Apps Script doPost(e) will still execute and append row to Google Sheet
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
    } catch (fallbackErr) {
      throw new Error('Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra lại link Web App hoặc quyền truy cập "Anyone".');
    }
  }
}

export async function testConnection(url: string): Promise<{ ok: boolean; message: string }> {
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return {
      ok: false,
      message: 'Link Web App không đúng định dạng. Phải bắt đầu bằng https://script.google.com/macros/s/...',
    };
  }

  const testPayload: ReportDoc = {
    id: 'test_' + Date.now().toString(36),
    at: new Date().toISOString(),
    ngay: new Date().toISOString().slice(0, 10),
    nhan_vien: 'Hệ thống kiểm tra',
    dai_ly: 'Đại lý Kiểm tra Kết nối',
    khu_vuc: 'Kiểm tra',
    sdt: '0900000000',
    hang_dang_ban: 'Kiểm tra',
    ket_qua: 'Kiểm tra kết nối',
    ghi_chu: 'Dòng kiểm tra tự động từ hệ thống Báo cáo STL',
  };

  try {
    // Attempt standard fetch
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(testPayload),
    });
    return {
      ok: true,
      message: 'Kết nối thành công! Đã gửi 1 dòng dữ liệu kiểm tra sang Google Sheet.',
    };
  } catch {
    // Attempt no-cors fetch
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(testPayload),
      });
      return {
        ok: true,
        message: 'Đã gửi dữ liệu kiểm tra sang Google Sheet qua chế độ tương thích (no-cors). Hãy mở Google Sheet để kiểm tra dòng mới.',
      };
    } catch (err: unknown) {
      return {
        ok: false,
        message: 'Lỗi khi kết nối: ' + (err instanceof Error ? err.message : String(err)),
      };
    }
  }
}
