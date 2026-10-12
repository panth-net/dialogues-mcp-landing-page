"use client";

import { useEffect, useId, useRef, useState } from "react";

type Status = "idle" | "copied" | "failed";

type CopyBlockProps = {
  /** Visible heading for the block; also used in the button's accessible name. */
  title: string;
  text: string;
  /** Optional element rendered next to the title (e.g. a status badge). */
  badge?: React.ReactNode;
  description?: React.ReactNode;
  /** Visual size of the text box. */
  variant?: "prompt" | "message";
  headingLevel?: "h2" | "h3";
};

function selectContents(node: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.75" y="5.75" width="7" height="7" rx="1.25" />
      <path d="M10.25 5.75V4.25A1.25 1.25 0 0 0 9 3H4.25A1.25 1.25 0 0 0 3 4.25V9A1.25 1.25 0 0 0 4.25 10.25H5.75" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path className="btn-copy-check" pathLength="1" d="M3.25 8.25 6.5 11.5 12.75 4.5" />
    </svg>
  );
}

async function copyText(text: string, node: HTMLElement | null): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path (e.g. permission denied, insecure context).
  }
  if (!node) return false;
  try {
    selectContents(node);
    // Legacy fallback for browsers without the async Clipboard API.
    return document.execCommand("copy");
  } catch {
    return false;
  }
}

export function CopyBlock({
  title,
  text,
  badge,
  description,
  variant = "prompt",
  headingLevel: Heading = "h2",
}: CopyBlockProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [playId, setPlayId] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const headingId = useId();
  const textId = useId();

  const clamp = variant === "prompt" && !expanded;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const node = windowRef.current;
    if (!node || !clamp) {
      setOverflows(false);
      return;
    }
    const measure = () => setOverflows(node.scrollHeight > node.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [clamp, text]);

  useEffect(() => {
    if (playId === 0) return;
    const button = buttonRef.current;
    const frame = frameRef.current;
    if (button) {
      button.classList.remove("is-pop");
      void button.offsetWidth;
      button.classList.add("is-pop");
    }
    if (frame) {
      frame.classList.remove("is-flash");
      void frame.offsetWidth;
      frame.classList.add("is-flash");
    }
  }, [playId]);

  async function handleCopy() {
    window.clearTimeout(timer.current);
    const ok = await copyText(text, textRef.current);
    if (ok) {
      setStatus("copied");
      setPlayId((value) => value + 1);
      timer.current = window.setTimeout(() => setStatus("idle"), 2000);
    } else {
      // Leave the text selected so the visitor can copy it by hand.
      if (textRef.current) selectContents(textRef.current);
      setStatus("failed");
    }
  }

  const failHint =
    "Couldn't copy automatically. The text is selected: press Ctrl+C (or Cmd+C on a Mac) to copy it.";
  const message =
    status === "copied" ? `${title} copied to clipboard.` : status === "failed" ? failHint : "";

  return (
    <section aria-labelledby={headingId} className="card flex min-h-0 flex-col gap-3 p-5 sm:p-7 short:gap-2 short:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <Heading id={headingId} className="text-base font-semibold text-white">
            {title}
          </Heading>
          {badge}
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleCopy}
          aria-controls={textId}
          className={`btn-copy shrink-0${status === "copied" ? " is-copied" : status === "failed" ? " is-failed" : ""}`}
        >
          <span aria-hidden="true" className="btn-copy-gradient" />
          {status === "copied" ? (
            <span key={`sheen-${playId}`} aria-hidden="true" className="btn-copy-sheen" />
          ) : null}
          <span key={status === "copied" ? `icon-${playId}` : status} aria-hidden="true" className="btn-copy-icon">
            {status === "copied" ? <CheckIcon /> : <CopyIcon />}
          </span>
          <span className="btn-copy-label">
            {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy"}
          </span>
          <span className="sr-only"> {title.toLowerCase()}</span>
        </button>
      </div>
      {description ? <div className="text-sm text-ink-soft">{description}</div> : null}
      <div ref={frameRef} className="copy-frame">
        <div
          ref={windowRef}
          className={`copy-window${clamp ? " is-clamped" : ""}${overflows ? " is-overflowing" : ""}`}
        >
          <pre
            ref={textRef}
            id={textId}
            tabIndex={0}
            aria-label={`${title} text`}
            className={`copy-text short:leading-[1.45] ${variant === "prompt" ? "copy-text--prompt" : "copy-text--message"}`}
          >
            {text}
          </pre>
        </div>
        {overflows ? (
          <button
            type="button"
            className="see-all"
            aria-expanded="false"
            aria-controls={textId}
            onClick={() => {
              setExpanded(true);
              textRef.current?.focus();
            }}
          >
            See all
          </button>
        ) : null}
      </div>
      {status === "failed" ? (
        <p className="text-sm text-ink-soft" aria-hidden="true">
          {failHint}
        </p>
      ) : null}
      {/* Always mounted so screen readers pick up changes; visible feedback is the
          button label (and the hint above when copying fails). */}
      <p role="status" aria-live="polite" className="sr-only">
        {message}
      </p>
    </section>
  );
}
