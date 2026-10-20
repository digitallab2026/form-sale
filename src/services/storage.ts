import { ReportDoc } from '../types';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const v = localStorage.getItem(key);
      return v === null ? defaultValue : (JSON.parse(v) as T);
    } catch {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage quota errors
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

export const STORAGE_KEYS = {
  EMPLOYEE_NAME: 'stl_ten_nv',
  HISTORY: 'stl_lich_su',
  QUEUE: 'stl_cho_gui',
  SHEET_URL: 'stl_sheet_url',
};

export function getEmployeeName(): string {
  return storage.get<string>(STORAGE_KEYS.EMPLOYEE_NAME, '');
}

export function saveEmployeeName(name: string): void {
  storage.set(STORAGE_KEYS.EMPLOYEE_NAME, name);
}

export function getHistory(): ReportDoc[] {
  return storage.get<ReportDoc[]>(STORAGE_KEYS.HISTORY, []);
}

export function saveHistory(history: ReportDoc[]): void {
  storage.set(STORAGE_KEYS.HISTORY, history);
}

export function getQueue(): ReportDoc[] {
  return storage.get<ReportDoc[]>(STORAGE_KEYS.QUEUE, []);
}

export function saveQueue(queue: ReportDoc[]): void {
  storage.set(STORAGE_KEYS.QUEUE, queue);
}

export function getSheetUrl(): string {
  return storage.get<string>(
    STORAGE_KEYS.SHEET_URL,
    (import.meta.env.VITE_APPS_SCRIPT_URL as string) || ''
  );
}

export function saveSheetUrl(url: string): void {
  storage.set(STORAGE_KEYS.SHEET_URL, url);
}
