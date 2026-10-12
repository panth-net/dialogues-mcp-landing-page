"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

type Tab = { label: string; content: React.ReactNode };

/**
 * Underlined tabs. The underline slides to the chosen tab; the panels share
 * one grid cell, so the column keeps its height when switching.
 */
export function InfoTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  // Slide only after the underline has been placed once, so it doesn't grow
  // in from the left edge on load.
  const [animate, setAnimate] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = tabRefs.current[active];
      if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    // Widths change once the web font loads, and on zoom.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    if (!indicator || animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [indicator, animate]);

  function select(index: number) {
    setActive(index);
    tabRefs.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? active === last ? 0 : active + 1
        : event.key === "ArrowLeft"
          ? active === 0 ? last : active - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
  }

  return (
    <div className="w-full max-w-xl">
      <div className="tab-bar">
        <div ref={listRef} role="tablist" className="tab-list" onKeyDown={onKeyDown}>
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={index === active}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={index === active ? 0 : -1}
              onClick={() => setActive(index)}
              className="tab"
            >
              {tab.label}
            </button>
          ))}
          <span
            aria-hidden="true"
            className="tab-indicator"
            data-ready={indicator ? "" : undefined}
            data-animate={animate ? "" : undefined}
            style={
              indicator
                ? { transform: `translateX(${indicator.left}px) scaleX(${indicator.width})` }
                : undefined
            }
          />
        </div>
      </div>
      <div className="tab-panels">
        {tabs.map((tab, index) => (
          <div
            key={tab.label}
            role="tabpanel"
            id={`${baseId}-panel-${index}`}
            aria-labelledby={`${baseId}-tab-${index}`}
            data-active={index === active}
            inert={index !== active}
            className="tab-panel"
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
