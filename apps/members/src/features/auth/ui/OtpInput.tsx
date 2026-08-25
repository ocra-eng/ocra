import { useRef, type ClipboardEvent, type KeyboardEvent } from "react"
import { cn } from "@ocra/ui"

interface OtpInputProps {
  length: number
  value: string
  onChange: (value: string) => void
  /** Fired when the last box is filled, so the form can submit itself. */
  onComplete?: (value: string) => void
  invalid?: boolean
  label: string
  disabled?: boolean
}

const digitsOnly = (text: string) => text.replace(/\D/g, "")

/**
 * Segmented code entry. One box per digit, but a single logical value —
 * pasting a whole code fills every box, which is what people actually do
 * with a code sitting in another window.
 */
export const OtpInput = ({
  length,
  value,
  onChange,
  onComplete,
  invalid = false,
  label,
  disabled = false,
}: OtpInputProps) => {
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    boxes.current[clamped]?.focus()
    boxes.current[clamped]?.select()
  }

  const commit = (next: string) => {
    onChange(next)
    if (next.length === length) onComplete?.(next)
  }

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, " ").split("")
    chars[index] = digit
    commit(chars.join("").replace(/ /g, "").slice(0, length))
  }

  const onBoxChange = (index: number, raw: string) => {
    const digits = digitsOnly(raw)
    if (!digits) return

    // Typing over a box, or an autofilled code landing in one box.
    if (digits.length > 1) {
      commit(digits.slice(0, length))
      focusBox(digits.length)
      return
    }

    setDigit(index, digits)
    focusBox(index + 1)
  }

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault()
      if (value[index]) {
        // Clear this box and stay put.
        commit(value.slice(0, index) + value.slice(index + 1))
      } else {
        commit(value.slice(0, Math.max(0, index - 1)) + value.slice(index))
        focusBox(index - 1)
      }
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      focusBox(index - 1)
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const digits = digitsOnly(event.clipboardData.getData("text")).slice(0, length)
    if (!digits) return
    commit(digits)
    focusBox(digits.length)
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-1.5"
      onPaste={onPaste}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          // Only the first box advertises autofill, or browsers offer the
          // whole code to every box.
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={value[index] ?? ""}
          onChange={(event) => onBoxChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onFocus={(event) => event.target.select()}
          aria-label={`${label} ${index + 1}`}
          aria-invalid={invalid}
          disabled={disabled}
          autoFocus={index === 0}
          className={cn(
            "min-w-0 flex-1 border bg-bg py-3 text-center font-mono text-xl text-ink outline-none transition-colors motion-reduce:transition-none",
            "focus-visible:border-accent",
            invalid ? "border-tape" : "border-line",
            disabled && "opacity-60"
          )}
        />
      ))}
    </div>
  )
}
