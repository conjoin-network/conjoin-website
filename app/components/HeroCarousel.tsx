"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ButtonLink } from "@/app/components/Button";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  primaryCta: {
    href: string;
    label: string;
  };
  secondaryCta: {
    href: string;
    label: string;
  };
  image: {
    src: string;
    alt: string;
  };
};

const AUTOPLAY_MS = 2000;
const SWIPE_THRESHOLD = 44;

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "microsoft",
    title: "Microsoft 365 licensing mapped for your team size and compliance scope.",
    subtitle: "Business and enterprise plan selection with migration-readiness and renewal governance.",
    primaryCta: {
      href: "/request-quote?brand=Microsoft&source=/",
      label: "Request Microsoft Quote"
    },
    secondaryCta: {
      href: "/microsoft",
      label: "View Microsoft Plans"
    },
    image: {
      src: "/brand/conjoin-logo.png",
      alt: "Microsoft advisory banner"
    }
  },
  {
    id: "seqrite",
    title: "Seqrite endpoint protection with cloud or on-prem deployment clarity.",
    subtitle: "Policy baseline, deployment sequencing, and support workflows for security operations.",
    primaryCta: {
      href: "/request-quote?brand=Seqrite&source=/",
      label: "Request Seqrite Quote"
    },
    secondaryCta: {
      href: "/seqrite",
      label: "Explore Seqrite"
    },
    image: {
      src: "/brand/conjoin-logo.png",
      alt: "Seqrite advisory banner"
    }
  },
  {
    id: "cisco",
    title: "Cisco networking and security procurement support for business rollouts.",
    subtitle: "Requirement framing, deployment scope, and TCO-friendly commercial options.",
    primaryCta: {
      href: "/request-quote?brand=Cisco&source=/",
      label: "Request Cisco Quote"
    },
    secondaryCta: {
      href: "/cisco",
      label: "Explore Cisco"
    },
    image: {
      src: "/brand/conjoin-logo.png",
      alt: "Cisco advisory banner"
    }
  },
  {
    id: "renewal",
    title: "Renewal, migration, and post-sales support under one procurement desk.",
    subtitle: "Commercial transparency for IT and purchase teams across Chandigarh and North India.",
    primaryCta: {
      href: "/request-quote?source=/",
      label: "Request Quote"
    },
    secondaryCta: {
      href: "/brands",
      label: "Browse All Brands"
    },
    image: {
      src: "/brand/conjoin-logo.png",
      alt: "Conjoin service advisory banner"
    }
  }
];

type HeroCarouselProps = {
  className?: string;
};

export default function HeroCarousel({ className = "" }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const trustBullets = useMemo(
    () => ["Since 2014", "Response in 15 minutes (business hours)", "Chandigarh Tricity + North India coverage"],
    []
  );

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  function goTo(index: number) {
    const normalized = (index + HERO_SLIDES.length) % HERO_SLIDES.length;
    setActiveIndex(normalized);
  }

  function onTouchStart(clientX: number) {
    setPaused(true);
    setTouchStartX(clientX);
  }

  function onTouchEnd(clientX: number) {
    if (touchStartX === null) {
      setPaused(false);
      return;
    }

    const delta = clientX - touchStartX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        goTo(activeIndex + 1);
      } else {
        goTo(activeIndex - 1);
      }
    }

    setTouchStartX(null);
    setPaused(false);
  }

  return (
    <header
      className={`hero-panel rounded-3xl p-6 md:p-8 ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => onTouchStart(event.touches[0]?.clientX ?? 0)}
      onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="grid gap-6 md:min-h-[450px] md:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] md:items-stretch">
        <div className="space-y-5">
          <h1 className="type-h1 text-balance text-[var(--color-text-primary)]">
            Microsoft, Seqrite & Cisco Solutions for Business Teams
          </h1>
          <p className="type-body text-balance">
            Licensing, migration, security, renewals & support - procurement-ready proposals.
          </p>

          <div className="relative min-h-[190px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:min-h-[180px] md:p-5">
            {HERO_SLIDES.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <article
                  key={slide.id}
                  aria-hidden={!active}
                  className={`absolute inset-0 space-y-4 p-4 transition-all duration-500 md:p-5 ${
                    active
                      ? "translate-x-0 opacity-100"
                      : "pointer-events-none translate-x-2 opacity-0"
                  }`}
                >
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] md:text-xl">{slide.title}</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{slide.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href={slide.primaryCta.href} variant="primary" className="min-h-[42px] px-4 text-xs md:text-sm">
                      {slide.primaryCta.label}
                    </ButtonLink>
                    <ButtonLink href={slide.secondaryCta.href} variant="secondary" className="min-h-[42px] px-4 text-xs md:text-sm">
                      {slide.secondaryCta.label}
                    </ButtonLink>
                  </div>
                </article>
              );
            })}
          </div>

          <ul className="grid gap-2 text-sm text-[var(--color-text-secondary)] md:grid-cols-3">
            {trustBullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={`dot-${slide.id}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={active}
                  onClick={() => goTo(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    active ? "w-6 bg-[var(--color-primary)]" : "w-2.5 bg-[var(--color-border)] hover:bg-[var(--color-text-secondary)]/50"
                  }`}
                />
              );
            })}

            <div className="ml-auto hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="header-icon-btn inline-flex h-9 w-9 items-center justify-center text-[var(--color-text-primary)]"
                aria-label="Previous slide"
              >
                <span aria-hidden>‹</span>
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="header-icon-btn inline-flex h-9 w-9 items-center justify-center text-[var(--color-text-primary)]"
                aria-label="Next slide"
              >
                <span aria-hidden>›</span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative hidden min-h-[350px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] md:block">
          {HERO_SLIDES.map((slide, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={`image-${slide.id}`}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center transition-opacity duration-500 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={slide.image.src}
                  alt={slide.image.alt}
                  width={180}
                  height={180}
                  priority={index === 0}
                  sizes="(max-width: 1024px) 0px, 180px"
                  className="h-auto w-auto max-w-[180px]"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                  {slide.id === "renewal" ? "Renewals & Support" : `${slide.id} Focus`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
