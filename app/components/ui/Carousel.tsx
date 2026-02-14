"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type CarouselItem = {
  id: string;
  title: string;
  description: string;
  panel: ReactNode;
};

type CarouselProps = {
  slides: CarouselItem[];
  autoplayMs?: number;
  className?: string;
  heightClassName?: string;
};

const SWIPE_THRESHOLD = 44;

export default function Carousel({
  slides,
  autoplayMs = 3000,
  className = "",
  heightClassName = "min-h-[420px]"
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    function onVisibilityChange() {
      setIsHidden(document.visibilityState !== "visible");
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isPlaying || isHovering || isHidden || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, isHidden, isHovering, isPlaying, slides.length]);

  function goNext() {
    setIndex((current) => (current + 1) % slides.length);
  }

  function goPrev() {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  }

  function onTouchStart(clientX: number) {
    setTouchStartX(clientX);
  }

  function onTouchEnd(clientX: number) {
    if (touchStartX === null) {
      return;
    }

    const delta = clientX - touchStartX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    setTouchStartX(null);
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] ${heightClassName} ${className}`.trim()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={(event) => onTouchStart(event.touches[0]?.clientX ?? 0)}
      onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      aria-roledescription="carousel"
      aria-label="Conjoin featured service lines"
    >
      <div className="absolute inset-x-0 top-0 z-20 hidden items-center justify-between p-3 md:flex md:p-4">
        <button
          type="button"
          onClick={() => setIsPlaying((value) => !value)}
          className="interactive-btn inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-primary)]"
          aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={goPrev}
            className="interactive-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
            aria-label="Previous slide"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="interactive-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)]"
            aria-label="Next slide"
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsPlaying((value) => !value)}
        className="interactive-btn absolute bottom-4 left-4 z-20 inline-flex min-h-10 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-primary)] md:hidden"
        aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      {slides.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <article
            key={slide.id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-all duration-300 ${
              active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-1 opacity-0"
            }`}
          >
            {slide.panel}
          </article>
        );
      })}

      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2">
        {slides.map((slide, dotIndex) => {
          const active = dotIndex === index;
          return (
            <button
              key={`dot-${slide.id}`}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`Go to slide ${dotIndex + 1}`}
              aria-current={active}
              className={`h-2.5 rounded-full transition-all ${
                active ? "w-6 bg-[var(--color-primary)]" : "w-2.5 bg-[var(--color-border)]"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
