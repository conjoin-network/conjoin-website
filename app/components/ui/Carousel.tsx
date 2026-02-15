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
    if (isHovering || isHidden || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, isHidden, isHovering, slides.length]);

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
      className={`relative overflow-visible rounded-3xl border border-[var(--color-border)] bg-[linear-gradient(155deg,#ffffff,#f8fbff)] pb-10 md:pb-12 ${heightClassName} ${className}`.trim()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={(event) => onTouchStart(event.touches[0]?.clientX ?? 0)}
      onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      aria-roledescription="carousel"
      aria-label="Conjoin featured service lines"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_16%_18%,rgba(37,99,235,0.08),transparent_42%),radial-gradient(circle_at_84%_82%,rgba(30,64,175,0.06),transparent_38%)]"
      />

      <div className="absolute inset-x-0 top-0 z-20 hidden justify-end p-3 md:flex md:p-4">
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={goPrev}
            className="interactive-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700"
            aria-label="Previous slide"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="interactive-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm text-slate-700"
            aria-label="Next slide"
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 h-full">
        <article key={slides[index].id} className="h-full animate-[fade-in_220ms_ease-out]">
          {slides[index].panel}
        </article>
      </div>

      <div className="absolute inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-20 flex items-center justify-center gap-2 md:bottom-5">
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
                active ? "w-6 bg-blue-600" : "w-2.5 bg-slate-300"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}
