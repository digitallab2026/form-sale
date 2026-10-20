import { ReportDoc } from '../types';
import { getSheetUrl } from './storage';

export async function sendReport(doc: ReportDoc): Promise<boolean> {
  const sheetUrl = getSheetUrl();
  if (!sheetUrl || sheetUrl === 'DAN_LINK_APPS_SCRIPT_VAO_DAY') {
    // If no external URL is configured, throw error to store in offline queue,
    // or simulate failure if needed.
    // In original code: fetch(SHEET_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(doc) })
    throw new Error('Chưa cấu hình liên kết Google Apps Script');
  }

  const response = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(doc),
  });

  const data = await response.json();
  if (!data || !data.ok) {
    throw new Error((data && data.error) || 'Lỗi khi gửi dữ liệu');
  }

  return true;
}
