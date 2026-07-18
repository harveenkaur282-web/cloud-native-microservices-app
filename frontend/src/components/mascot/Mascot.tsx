'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export type MascotState = 'idle' | 'typing' | 'success' | 'error' | 'sleeping';

interface MascotProps {
  state?: MascotState;
  className?: string;
  size?: number;
}

export default function Mascot({ state = 'idle', className, size = 80 }: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (state !== 'sleeping' && state !== 'error') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, [state]);

  // Determine visual elements based on state
  const getEyes = () => {
    if (state === 'sleeping') {
      // Curved sleeping eyes (n n)
      return (
        <>
          <path d="M 28 42 Q 33 47 38 42" stroke="#2E2522" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 52 42 Q 57 47 62 42" stroke="#2E2522" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
    }
    if (state === 'error') {
      // Squeezed eyes (> <)
      return (
        <>
          <path d="M 28 38 L 36 42 L 28 46" stroke="#8E2435" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 62 38 L 54 42 L 62 46" stroke="#8E2435" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    }
    if (isBlinking) {
      // Blink line (- -)
      return (
        <>
          <line x1="28" y1="42" x2="38" y2="42" stroke="#2E2522" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="52" y1="42" x2="62" y2="42" stroke="#2E2522" strokeWidth="3.5" strokeLinecap="round" />
        </>
      );
    }
    if (state === 'typing') {
      // Curled downward looking eyes
      return (
        <>
          <ellipse cx="33" cy="44" rx="3.5" ry="5" fill="#2E2522" />
          <ellipse cx="57" cy="44" rx="3.5" ry="5" fill="#2E2522" />
        </>
      );
    }
    // Normal cute circle eyes
    return (
      <>
        <ellipse cx="33" cy="40" rx="4" ry="5" fill="#2E2522" />
        <ellipse cx="57" cy="40" rx="4" ry="5" fill="#2E2522" />
        {/* Sparkle details */}
        <circle cx="31.5" cy="38.5" r="1.2" fill="white" />
        <circle cx="55.5" cy="38.5" r="1.2" fill="white" />
      </>
    );
  };

  const getMouth = () => {
    if (state === 'error') {
      return (
        <path d="M 40 52 Q 45 47 50 52" stroke="#8E2435" strokeWidth="3" strokeLinecap="round" fill="none" />
      );
    }
    if (state === 'typing') {
      return (
        <circle cx="45" cy="51" r="2.5" fill="#2E2522" />
      );
    }
    if (state === 'success') {
      return (
        <path d="M 39 49 Q 45 56 51 49" stroke="#2E2522" strokeWidth="3" fill="#FFB7B2" strokeLinecap="round" />
      );
    }
    // Standard smiley mouth
    return (
      <path d="M 40 49 Q 45 53 50 49" stroke="#2E2522" strokeWidth="3" strokeLinecap="round" fill="none" />
    );
  };

  const getCheeks = () => {
    if (state === 'sleeping') return null;
    return (
      <>
        <circle cx="23" cy="46" r="4.5" fill="#FFB7B2" opacity="0.6" />
        <circle cx="67" cy="46" r="4.5" fill="#FFB7B2" opacity="0.6" />
      </>
    );
  };

  // Animate values based on state
  const floatTransition = {
    duration: state === 'sleeping' ? 3.5 : 2.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  };

  const floatY = state === 'sleeping' ? [0, -4, 0] : [0, -7, 0];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        animate={
          state === 'error'
            ? { x: [0, -6, 6, -6, 6, 0] }
            : state === 'success'
            ? { y: [0, -12, 0, -6, 0], scale: [1, 1.05, 1] }
            : { y: floatY }
        }
        transition={
          state === 'error'
            ? { duration: 0.4 }
            : state === 'success'
            ? { duration: 0.6 }
            : {
                duration: state === 'sleeping' ? 3.5 : 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }
        }
        style={{ width: size, height: size }}
        className="relative"
      >
        <svg
          viewBox="0 0 90 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Glowing Shadow Background */}
          <circle
            cx="45"
            cy="48"
            r="38"
            fill={state === 'error' ? '#FFB7B2' : '#E8E8FF'}
            opacity="0.15"
            className="blur-md"
          />

          {/* Soft Illustrated Cloud Body */}
          <path
            d="M25 60C16 60 9 53 9 44C9 36 15 30 22 28C24 17 33 10 45 10C55 10 64 16 67 25C69 24 72 24 74 24C83 24 90 31 90 40C90 49 83 56 74 56L25 60Z"
            fill={state === 'error' ? '#FFF5F5' : '#FFFFFF'}
            stroke={state === 'error' ? '#FFB7B2' : '#FFE5D9'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Facial Elements Group */}
          <g>
            {getEyes()}
            {getCheeks()}
            {getMouth()}
          </g>
        </svg>

        {/* Small floating Zzz indicators for sleeping state */}
        {state === 'sleeping' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5, x: 10, y: -10 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1, 0.6], x: [10, 22, 28], y: [-10, -25, -35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-0 text-[10px] font-bold text-slate-400 font-mono"
          >
            Zzz
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
