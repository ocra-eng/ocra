import { useCallback, useState } from "react"

type ShareState = "idle" | "copied"

interface UseShareCardResult {
  /** True when the OS share sheet is available (most phones). */
  canShare: boolean
  state: ShareState
  share: () => Promise<void>
}

/**
 * Hands the public card URL to the OS share sheet where there is one, and
 * falls back to the clipboard everywhere else.
 */
export const useShareCard = (
  url: string,
  title: string
): UseShareCardResult => {
  const [state, setState] = useState<ShareState>("idle")
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function"

  const share = useCallback(async () => {
    if (!url) return

    if (canShare) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Cancelling the sheet rejects; fall through to copying rather than
        // reporting an error the member did not cause.
      }
    }

    try {
      await navigator.clipboard?.writeText(url)
      setState("copied")
      setTimeout(() => setState("idle"), 2000)
    } catch {
      /* clipboard blocked — the QR is still on screen */
    }
  }, [canShare, title, url])

  return { canShare, state, share }
}
