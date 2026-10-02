"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { EventPoster, posterName } from "@/components/event-poster";
import { DURATION, EASE_OUT, INTRO, STRIP } from "@/components/motion/timing";

export type StripItem = {
  slug: string;
  name: string;
  mode: string;
  status: string;
};

const HEIGHTS = [
  "h-[80cqh]",
  "h-[34cqh]",
  "h-[80cqh]",
  "h-[62cqh]",
  "h-[34cqh]",
  "h-[80cqh]",
  "h-[80cqh]",
];

const MIN_CARDS = 9;

export function EventStrip({ items }: { items: StripItem[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const motionState = useRef({
    target: 0,
    current: 0,
    velocity: 0,
    dragging: false,
    lastX: 0,
    moved: 0,
  });

  const cards = items.length
    ? Array.from(
        { length: Math.ceil(MIN_CARDS / items.length) * items.length },
        (_, index) => items[index % items.length]!,
      )
    : [];
  const loop = [...cards, ...cards];

  useEffect(() => {
    const state = motionState.current;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      state.velocity = 0;
      state.target += delta * STRIP.wheel;
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") state.target += 240;
      if (event.key === "ArrowLeft") state.target -= 240;
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useAnimationFrame(() => {
    const state = motionState.current;
    const strip = track.current;
    if (!strip) return;
    if (!state.dragging && Math.abs(state.velocity) > 0.05) {
      state.target += state.velocity;
      state.velocity *= STRIP.friction;
    }
    const previous = state.current;
    state.current += (state.target - state.current) * STRIP.ease;
    const half = strip.scrollWidth / 2;
    if (!half) return;
    const offset = ((state.current % half) + half) % half;
    const speed = reduced ? 0 : state.current - previous;
    const skew = Math.max(
      -STRIP.maxSkew,
      Math.min(STRIP.maxSkew, speed * STRIP.skew),
    );
    strip.style.transform = `translate3d(${-offset}px, 0, 0) skewX(${-skew}deg)`;
    strip.style.setProperty("--shift", `${(skew * 1.5).toFixed(2)}%`);
    const page = viewport.current?.parentElement;
    page?.style.setProperty("--strip-speed", skew.toFixed(3));
    page?.style.setProperty("--strip-speed-abs", Math.abs(skew).toFixed(3));
  });

  const down = (event: React.PointerEvent) => {
    const state = motionState.current;
    state.dragging = true;
    state.lastX = event.clientX;
    state.moved = 0;
    state.velocity = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent) => {
    const state = motionState.current;
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    state.lastX = event.clientX;
    state.moved += Math.abs(dx);
    state.target -= dx * STRIP.drag;
    state.velocity = -dx * STRIP.drag;
  };

  const up = (event: React.PointerEvent) => {
    motionState.current.dragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (!cards.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center px-4 font-mono text-sm text-muted-foreground uppercase md:px-5">
        No events yet. Check back soon.
      </div>
    );
  }

  return (
    <motion.div
      ref={viewport}
      className="[container-type:size] relative min-h-0 flex-1 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClickCapture={(event) => {
        if (motionState.current.moved > STRIP.tap) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: DURATION.reveal * 1.4,
        ease: EASE_OUT,
        delay: INTRO.strip,
      }}
    >
      <div
        ref={track}
        className="flex w-max items-start gap-3 pt-3 will-change-transform md:gap-3"
      >
        {loop.map((item, index) => (
          <Link
            key={`${item.slug}-${index}`}
            href={`/${item.slug}`}
            draggable={false}
            tabIndex={index < cards.length ? 0 : -1}
            aria-hidden={index >= cards.length ? true : undefined}
            className="group flex w-[clamp(9.5rem,13.4vw,16rem)] shrink-0 flex-col gap-2"
          >
            <span
              className={`block overflow-hidden ${HEIGHTS[index % HEIGHTS.length]}`}
            >
              <span className="block size-full [transform:translateX(var(--shift,0%))_scale(1.06)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[transform:translateX(var(--shift,0%))_scale(1.12)]">
                <EventPoster
                  name={item.name}
                  mode={item.mode}
                  tone={index % items.length}
                />
              </span>
            </span>
            <span className="flex flex-col font-mono text-[0.7rem] leading-tight uppercase md:text-xs">
              <span className="font-semibold">{posterName(item.name)}</span>
              <span className="text-muted-foreground">{item.status}</span>
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
