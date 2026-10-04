import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type InputEvent
} from 'react';
import type { Currency } from '@/shared/lib/types';
import { formatMoney, parseMoney } from '@/shared/lib/money';
import { Input, type InputProps } from './input';

export interface MoneyInputProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'defaultValue'
> {
  /** Minor units (cents) or `null` while the field is empty/invalid. */
  value: number | null;
  onValueChange: (value: number | null) => void;
  currency: Currency;
}

/**
 * Decimal money field (`inputmode="decimal"`). Keeps the raw text while the
 * user types (es-AR conventions) and reformats to `1.234,56` on blur.
 */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    { value, onValueChange, currency, onFocus, onBlur, className, ...props },
    ref
  ) {
    const format = (minor: number | null): string =>
      minor === null ? '' : formatMoney(minor, currency, { symbol: false });

    const [text, setText] = useState(() => format(value));
    const focusedRef = useRef(false);

    useEffect(() => {
      if (focusedRef.current) return;
      setText(value === null ? '' : formatMoney(value, currency, { symbol: false }));
    }, [value, currency]);

    const handleInput = (event: InputEvent<HTMLInputElement>) => {
      const next = event.currentTarget.value;
      setText(next);
      onValueChange(parseMoney(next));
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      focusedRef.current = true;
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      const parsed = parseMoney(text);
      setText(format(parsed));
      if (parsed !== value) onValueChange(parsed);
      onBlur?.(event);
    };

    return (
      <Input
        ref={ref}
        className={className}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        value={text}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);
