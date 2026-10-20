import React, { useState, useEffect, useRef } from 'react';

interface NameDialogProps {
  isOpen: boolean;
  currentName: string;
  onSave: (name: string) => void;
  onClose?: () => void;
}

export const NameDialog: React.FC<NameDialogProps> = ({
  isOpen,
  currentName,
  onSave,
}) => {
  const [val, setVal] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVal(currentName);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = val.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    onSave(trimmed);
  };

  return (
    <div className="dlg">
      <div
        className="dlg-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlgTitle"
      >
        <h2 id="dlgTitle" className="text-[20px] font-bold m-0">
          Bạn tên là gì?
        </h2>
        <p className="hint m-0 text-muted">
          Chỉ hỏi một lần, máy sẽ nhớ cho các lần sau.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            id="myName"
            autoComplete="name"
            placeholder="VD: Ngô Ngọc Hoan"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <button className="save" type="submit">
            Xong
          </button>
        </form>
      </div>
    </div>
  );
};
