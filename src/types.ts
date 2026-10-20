export interface ReportDoc {
  id: string;
  at: string; // ISO string
  ngay: string; // YYYY-MM-DD
  nhan_vien: string;
  dai_ly: string;
  khu_vuc: string;
  sdt: string;
  hang_dang_ban: string;
  ket_qua: string;
  ghi_chu: string;
}

export type ScreenMode = 'form' | 'done';
