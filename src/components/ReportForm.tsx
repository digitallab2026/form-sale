import React, { useState, useEffect } from 'react';
import { BRANDS, RESULTS } from '../constants';
import { Mic, MicOff } from 'lucide-react';

export interface FormData {
  dai_ly: string;
  khu_vuc: string;
  sdt: string;
  hang_dang_ban: string[];
  ket_qua: string;
  ghi_chu: string;
}

interface ReportFormProps {
  formData: FormData;
  onChange: (updater: (prev: FormData) => FormData) => void;
  hasNameError: boolean;
  onClearNameError: () => void;
  formRef: React.RefObject<HTMLFormElement | null>;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  formData,
  onChange,
  hasNameError,
  onClearNameError,
  formRef,
  nameInputRef,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const toggleBrand = (brand: string) => {
    onChange((prev) => {
      const exists = prev.hang_dang_ban.includes(brand);
      const updated = exists
        ? prev.hang_dang_ban.filter((b) => b !== brand)
        : [...prev.hang_dang_ban, brand];
      return { ...prev, hang_dang_ban: updated };
    });
  };

  const toggleResult = (res: string) => {
    onChange((prev) => ({
      ...prev,
      ket_qua: prev.ket_qua === res ? '' : res,
    }));
  };

  const startVoiceInput = () => {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onChange((prev) => ({
            ...prev,
            ghi_chu: prev.ghi_chu ? `${prev.ghi_chu} ${transcript}` : transcript,
          }));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <form ref={formRef} id="f" noValidate className="flex flex-col gap-[14px]">
      {/* 1. Tên đại lý */}
      <div className={`q ${hasNameError ? 'err' : ''}`} id="qName">
        <label htmlFor="dai_ly">
          1. Tên đại lý <span className="req">*</span>
        </label>
        <input
          ref={nameInputRef}
          type="text"
          id="dai_ly"
          autoComplete="off"
          placeholder="VD: Đại lý Chính Hiền"
          value={formData.dai_ly}
          onChange={(e) => {
            if (hasNameError) onClearNameError();
            onChange((prev) => ({ ...prev, dai_ly: e.target.value }));
          }}
        />
        {hasNameError && (
          <span className="errmsg" id="nameErr">
            Bạn cần ghi tên đại lý.
          </span>
        )}
      </div>

      {/* 2. Ở đâu */}
      <div className="q">
        <label htmlFor="khu_vuc">
          2. Ở đâu? <span className="opt">(xã/huyện)</span>
        </label>
        <input
          type="text"
          id="khu_vuc"
          autoComplete="off"
          placeholder="VD: Quang Minh, Mê Linh"
          value={formData.khu_vuc}
          onChange={(e) => onChange((prev) => ({ ...prev, khu_vuc: e.target.value }))}
        />
      </div>

      {/* 3. Số điện thoại */}
      <div className="q">
        <label htmlFor="sdt">
          3. Số điện thoại chủ đại lý <span className="opt">(nếu có)</span>
        </label>
        <input
          type="tel"
          id="sdt"
          inputMode="tel"
          autoComplete="off"
          placeholder="09xx xxx xxx"
          value={formData.sdt}
          onChange={(e) => onChange((prev) => ({ ...prev, sdt: e.target.value }))}
        />
      </div>

      {/* 4. Hãng sơn */}
      <div className="q">
        <span className="lbl" id="hangLbl">
          4. Đại lý đang bán sơn gì? <span className="opt">(chọn nhiều)</span>
        </span>
        <div className="chips" role="group" aria-labelledby="hangLbl">
          {BRANDS.map((brand) => {
            const isPressed = formData.hang_dang_ban.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                className="chip"
                aria-pressed={isPressed}
                onClick={() => toggleBrand(brand)}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Kết quả hôm nay */}
      <div className="q">
        <span className="lbl" id="kqLbl">
          5. Kết quả hôm nay
        </span>
        <div className="results" role="radiogroup" aria-labelledby="kqLbl">
          {RESULTS.map((res) => {
            const isChecked = formData.ket_qua === res;
            return (
              <button
                key={res}
                type="button"
                className="res"
                role="radio"
                aria-checked={isChecked}
                onClick={() => toggleResult(res)}
              >
                <span className="dot" />
                <span>{res}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Ghi chú */}
      <div className="q">
        <div className="flex items-center justify-between">
          <label htmlFor="ghi_chu">
            6. Ghi chú thêm <span className="opt">(nếu có)</span>
          </label>
          {speechSupported && (
            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                isListening
                  ? 'bg-bad text-white animate-pulse'
                  : 'text-accent hover:bg-accent/10'
              }`}
              title="Nhấn để nói"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" /> Đang nghe...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> Bấm để nói
                </>
              )}
            </button>
          )}
        </div>
        <p className="hint">Mẹo: bấm biểu tượng micro trên bàn phím để nói thay vì gõ.</p>
        <textarea
          id="ghi_chu"
          placeholder="VD: Muốn xin biển bảng, hẹn tuần sau gửi báo giá"
          value={formData.ghi_chu}
          onChange={(e) => onChange((prev) => ({ ...prev, ghi_chu: e.target.value }))}
        />
      </div>
    </form>
  );
};
