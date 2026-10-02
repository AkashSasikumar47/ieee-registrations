"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FLAP, INTRO } from "@/components/motion/timing";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const WORDS = [
  { text: "IEEE", className: "text-primary" },
  { text: "REGISTRATIONS", className: "" },
];

const LETTERS = WORDS.flatMap((word, wordIndex) =>
  Array.from(word.text).map((letter) => ({ letter, wordIndex })),
);

type Roll = { id: number; chars: string[]; delay: number };

function randomChars(letter: string) {
  return [
    letter,
    ...Array.from(
      { length: FLAP.spins },
      () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!,
    ),
    letter,
  ];
}

function Flap({ letter, roll }: { letter: string; roll?: Roll }) {
  const steps = roll ? roll.chars.length - 1 : 0;

  return (
    <span className="relative -my-[0.11em] inline-block overflow-hidden align-bottom leading-none">
      <span className="invisible">{letter}</span>
      {roll ? (
        <motion.span
          key={roll.id}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 flex flex-col items-center"
          initial={{ y: "0em" }}
          animate={{ y: `-${steps}em` }}
          transition={{
            duration: FLAP.roll,
            delay: roll.delay,
            ease: [0.45, 0, 0.2, 1],
          }}
        >
          {roll.chars.map((char, index) => (
            <span key={index} className="block h-[1em]">
              {char}
            </span>
          ))}
        </motion.span>
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 text-center"
        >
          {letter}
        </span>
      )}
    </span>
  );
}

export function FlapWordmark({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const [rolls, setRolls] = useState<(Roll | undefined)[]>([]);
  const counter = useRef(0);

  const flip = (indexes: number[], stagger: number, offset = 0) => {
    setRolls((current) => {
      const next = [...current];
      indexes.forEach((index, order) => {
        counter.current += 1;
        next[index] = {
          id: counter.current,
          chars: randomChars(LETTERS[index]!.letter),
          delay: offset + order * stagger,
        };
      });
      return next;
    });
  };

  useEffect(() => {
    if (reduced) return;
    const all = LETTERS.map((_, index) => index);
    flip(all, FLAP.stagger, INTRO.wordmark);
    const ripple = window.setInterval(
      () => flip(all, FLAP.stagger),
      FLAP.ripple * 1000,
    );
    const tick = window.setInterval(
      () => flip([Math.floor(Math.random() * LETTERS.length)], 0),
      FLAP.tick * 1000,
    );
    return () => {
      window.clearInterval(ripple);
      window.clearInterval(tick);
    };
  }, [reduced]);

  let cursor = 0;

  return (
    <div
      aria-label="IEEE Registrations"
      className={`origin-bottom-left ${className}`}
      style={{
        transform: `skewX(calc(var(--strip-speed, 0) * -${FLAP.lean}deg)) scaleY(calc(1 + var(--strip-speed-abs, 0) * ${FLAP.stretch}))`,
      }}
    >
      {WORDS.map((word) => (
        <span key={word.text} className={`inline-block ${word.className}`}>
          {Array.from(word.text).map((letter) => {
            const index = cursor++;
            return (
              <span
                key={index}
                onPointerEnter={() => !reduced && flip([index], 0)}
                className="inline-block"
              >
                <Flap letter={letter} roll={rolls[index]} />
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
