"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { centsToHuman, parseHumanToCents } from "@/lib/format";

interface MoneyInputProps {
  /** Current value in cents */
  value: number;
  onChange: (cents: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Show N$ prefix */
  showPrefix?: boolean;
}

export function MoneyInput({
  value,
  onChange,
  className,
  placeholder = "0",
  disabled = false,
  id,
  showPrefix = true,
}: MoneyInputProps) {
  const [text, setText] = useState(() => centsToHuman(value));
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (!focused) {
      setText(centsToHuman(value));
    }
  }, [value, focused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow digits, decimal point, comma, and backspace/delete
      if (!/^[\d,.]*$/.test(raw) && raw !== "") return;
      setText(raw);
      const cents = parseHumanToCents(raw);
      onChange(cents);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setFocused(false);
    // Format on blur: always show 2 decimal places
    const cents = parseHumanToCents(text);
    setText(centsToHuman(cents));
    onChange(cents);
  }, [text, onChange]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    // Select all text on focus for easy replacement
    inputRef.current?.select();
  }, []);

  return (
    <div className="relative">
      {showPrefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium pointer-events-none select-none">
          N$
        </span>
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-11 w-full rounded-lg border border-border bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors",
          showPrefix ? "pl-9" : "px-3",
          className,
        )}
      />
    </div>
  );
}
