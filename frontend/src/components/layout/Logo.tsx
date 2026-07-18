import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cloud Basket Shape */}
      <path
        d="M25 55C18 55 12 49 12 42C12 36 17 31 23 30C25 21 33 15 42 15C50 15 57 20 60 27C62 26 64 26 66 26C74 26 80 32 80 40C80 48 74 54 66 54H25V55Z"
        fill="url(#cloudGrad)"
        stroke="#FFE5D9"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Shopping Cart Handle and Chassis */}
      <path
        d="M18 35H10V20"
        stroke="#2E2522"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 54L30 72H68L78 54"
        stroke="#2E2522"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Cart Wheels */}
      <circle cx="36" cy="78" r="8" fill="#FFFDF9" stroke="#FFB7B2" strokeWidth="4" />
      <circle cx="36" cy="78" r="2.5" fill="#2E2522" />
      
      <circle cx="62" cy="78" r="8" fill="#FFFDF9" stroke="#FFB7B2" strokeWidth="4" />
      <circle cx="62" cy="78" r="2.5" fill="#2E2522" />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="cloudGrad" x1="12" y1="15" x2="80" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8E8FF" />
          <stop offset="100%" stopColor="#D8D8FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
