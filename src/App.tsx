import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DailyQuote } from './components/DailyQuote';
import { WhoBanner } from './components/WhoBanner';
import { PendingBanner } from './components/PendingBanner';
import { ReportForm, FormData } from './components/ReportForm';
import { SuccessView } from './components/SuccessView';
import { TodayHistory } from './components/TodayHistory';
import { NameDialog } from './components/NameDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ReportDoc, ScreenMode } from './types';
import { dayKey, formatTime } from './constants';
import {
  getEmployeeName,
  saveEmployeeName,
  getHistory,
  saveHistory,
  getQueue,
  saveQueue,
  getSheetUrl,
} from './services/storage';
import { sendReport } from './services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const initialFormData: FormData = {
  dai_ly: '',
  khu_vuc: '',
  sdt: '',
  hang_dang_ban: [],
  ket_qua: '',
  ghi_chu: '',
};

export const App: React.FC = () => {
  const [employeeName, setEmployeeName] = useState<string>('');
  const [isNameDialogOpen, setIsNameDialogOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hasSheetConfigured, setHasSheetConfigured] = useState<boolean>(false);
  const [mode, setMode] = useState<ScreenMode>('form');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [hasNameError, setHasNameError] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isStatusBad, setIsStatusBad] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Today's records and offline queue
  const [todayHistory, setTodayHistory] = useState<ReportDoc[]>([]);
  const [queue, setQueue] = useState<ReportDoc[]>([]);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);

  // Last submitted doc details for success view
  const [lastSubmitted, setLastSubmitted] = useState<{
    dealerName: string;
    timeString: string;
    isSent: boolean;
  }>({ dealerName: '', timeString: '', isSent: true });

  const formRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const checkSheetConfig = useCallback(() => {
    const url = getSheetUrl();
    const isConfigured = !!url && url.trim().length > 0 && url !== 'DAN_LINK_APPS_SCRIPT_VAO_DAY';
    setHasSheetConfigured(isConfigured);
    return isConfigured;
  }, []);

  // Load initial state
  useEffect(() => {
    const savedName = getEmployeeName();
    if (savedName) {
      setEmployeeName(savedName);
    } else {
      setIsNameDialogOpen(true);
    }

    checkSheetConfig();

    const todayStr = dayKey(new Date());
    const allHistory = getHistory();
    const todayItems = allHistory.filter((item) => item.ngay === todayStr);
    setTodayHistory(todayItems);

    const initialQueue = getQueue();
    setQueue(initialQueue);
  }, [checkSheetConfig]);

  // Flush offline queue
  const flushQueue = useCallback(async () => {
    const currentQueue = getQueue();
    if (currentQueue.length === 0) return;

    const isConfigured = checkSheetConfig();
    if (!isConfigured) return;

    setIsFlushing(true);
    let remaining = [...currentQueue];

    for (const doc of currentQueue) {
      try {
        await sendReport(doc);
        remaining = remaining.filter((q) => q.id !== doc.id);
        saveQueue(remaining);
        setQueue([...remaining]);
      } catch {
        // If one fails (e.g. still no connection), stop trying the rest for now
        break;
      }
    }

    setIsFlushing(false);
  }, [checkSheetConfig]);

  // Listen to online event to auto-sync
  useEffect(() => {
    window.addEventListener('online', flushQueue);
    return () => {
      window.removeEventListener('online', flushQueue);
    };
  }, [flushQueue]);

  const handleSaveName = (name: string) => {
    setEmployeeName(name);
    saveEmployeeName(name);
    setIsNameDialogOpen(false);
  };

  const handleBottomButtonClick = async () => {
    // If currently on done screen, reset to form for next dealer
    if (mode === 'done') {
      setMode('form');
      setStatusMessage('');
      setIsStatusBad(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return;
    }

    // Must have sales rep name
    if (!employeeName.trim()) {
      setIsNameDialogOpen(true);
      return;
    }

    // Validate dealer name
    const dealerName = formData.dai_ly.trim();
    if (!dealerName) {
      setHasNameError(true);
      nameInputRef.current?.focus();
      const el = document.getElementById('qName');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const at = new Date();
    const doc: ReportDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      at: at.toISOString(),
      ngay: dayKey(at),
      nhan_vien: employeeName.trim(),
      dai_ly: dealerName,
      khu_vuc: formData.khu_vuc.trim(),
      sdt: formData.sdt.replace(/\s+/g, ''),
      hang_dang_ban: formData.hang_dang_ban.join(', '),
      ket_qua: formData.ket_qua,
      ghi_chu: formData.ghi_chu.trim(),
    };

    setIsSubmitting(true);
    setStatusMessage('Đang lưu…');
    setIsStatusBad(false);

    let sent = true;
    try {
      await sendReport(doc);
    } catch {
      sent = false;
      const updatedQueue = [...queue, doc];
      saveQueue(updatedQueue);
      setQueue(updatedQueue);
    }

    // Save to local today history
    const allHistory = getHistory();
    const updatedHistory = [...allHistory, doc];
    saveHistory(updatedHistory);
    setTodayHistory((prev) => [...prev, doc]);

    // Reset form data
    setFormData(initialFormData);

    setLastSubmitted({
      dealerName,
      timeString: formatTime(doc.at),
      isSent: sent,
    });

    setMode('done');
    setStatusMessage('');
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="wrap">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        <WhoBanner
          name={employeeName}
          onChangeName={() => setIsNameDialogOpen(true)}
        />

        <DailyQuote />

        {/* Google Sheet Connection Banner */}
        {!hasSheetConfigured ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex flex-col">
                <span className="font-semibold text-xs sm:text-sm">Chưa liên kết Google Sheet</span>
                <span className="text-[12px] text-muted">Báo cáo sẽ lưu tạm trên máy cho đến khi bạn kết nối.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-accent text-accent-ink text-xs font-bold whitespace-nowrap hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Cấu hình ngay
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1 py-0.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã liên kết Google Sheet
            </span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-accent underline hover:opacity-80 transition-opacity"
            >
              Đổi liên kết
            </button>
          </div>
        )}

        <PendingBanner
          count={queue.length}
          isFlushing={isFlushing}
          onRetry={flushQueue}
        />

        {mode === 'form' ? (
          <ReportForm
            formData={formData}
            onChange={setFormData}
            hasNameError={hasNameError}
            onClearNameError={() => setHasNameError(false)}
            formRef={formRef}
            nameInputRef={nameInputRef}
          />
        ) : (
          <SuccessView
            isSent={lastSubmitted.isSent}
            dealerName={lastSubmitted.dealerName}
            timeString={lastSubmitted.timeString}
            hasSheetConfigured={hasSheetConfigured}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        <TodayHistory items={todayHistory} queue={queue} />
      </div>

      {/* Floating Bottom Bar */}
      <div className="bar">
        <div className="bar-in">
          <button
            className="save"
            id="saveBtn"
            type="button"
            disabled={isSubmitting}
            onClick={handleBottomButtonClick}
          >
            {mode === 'done' ? 'Nhập đại lý tiếp theo' : 'Lưu báo cáo'}
          </button>
          {statusMessage && (
            <div className={`status ${isStatusBad ? 'bad' : ''}`}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Name Input Dialog */}
      <NameDialog
        isOpen={isNameDialogOpen}
        currentName={employeeName}
        onSave={handleSaveName}
      />

      {/* Settings Dialog for Google Sheet Apps Script URL */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          checkSheetConfig();
        }}
        queueCount={queue.length}
        onFlushQueue={flushQueue}
      />
    </div>
  );
};

export default App;
