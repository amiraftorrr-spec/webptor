import React from "react";

export function BlissBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <svg
        className="w-full h-full object-cover min-w-[1024px] min-h-[768px]"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="blissSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a64c4" />
            <stop offset="25%" stopColor="#2c7fe4" />
            <stop offset="55%" stopColor="#67b2ff" />
            <stop offset="75%" stopColor="#a3d6ff" />
            <stop offset="85%" stopColor="#d2ecff" />
          </linearGradient>

          {/* Main Rolling Hill Gradients */}
          <linearGradient id="hillFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ab82d" />
            <stop offset="35%" stopColor="#8cdb38" />
            <stop offset="70%" stopColor="#559920" />
            <stop offset="100%" stopColor="#3d7215" />
          </linearGradient>

          <linearGradient id="hillBack" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#80c637" />
            <stop offset="40%" stopColor="#a7ea4b" />
            <stop offset="80%" stopColor="#63a726" />
            <stop offset="100%" stopColor="#4c841a" />
          </linearGradient>

          <linearGradient id="hillFar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#97d848" />
            <stop offset="50%" stopColor="#baf55e" />
            <stop offset="100%" stopColor="#75b52c" />
          </linearGradient>

          {/* Cloud Filters for Softness */}
          <filter id="cloudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1920" height="1080" fill="url(#blissSky)" />

        {/* Clouds */}
        <g filter="url(#cloudGlow)" opacity="0.88">
          {/* Distant horizon cloud haze */}
          <ellipse cx="960" cy="540" rx="900" ry="120" fill="#ffffff" opacity="0.4" />

          {/* Left clouds */}
          <ellipse cx="280" cy="220" rx="220" ry="60" fill="#ffffff" opacity="0.85" />
          <ellipse cx="360" cy="190" rx="160" ry="75" fill="#ffffff" opacity="0.95" />
          <ellipse cx="200" cy="230" rx="140" ry="45" fill="#ffffff" opacity="0.75" />
          <ellipse cx="480" cy="230" rx="180" ry="50" fill="#ffffff" opacity="0.6" />

          {/* Center-right high clouds */}
          <ellipse cx="1200" cy="180" rx="260" ry="70" fill="#ffffff" opacity="0.8" />
          <ellipse cx="1320" cy="150" rx="190" ry="85" fill="#ffffff" opacity="0.95" />
          <ellipse cx="1080" cy="190" rx="180" ry="55" fill="#ffffff" opacity="0.7" />

          {/* Far right wispy clouds */}
          <ellipse cx="1680" cy="260" rx="200" ry="50" fill="#ffffff" opacity="0.65" />
          <ellipse cx="1760" cy="240" rx="140" ry="60" fill="#ffffff" opacity="0.8" />

          {/* Middle fluffy layer */}
          <ellipse cx="750" cy="360" rx="320" ry="70" fill="#ffffff" opacity="0.5" />
          <ellipse cx="880" cy="340" rx="200" ry="60" fill="#ffffff" opacity="0.65" />
          <ellipse cx="1480" cy="380" rx="280" ry="60" fill="#ffffff" opacity="0.55" />
        </g>

        {/* Far Hills */}
        <path
          d="M0 680 C 450 560, 850 590, 1300 520 C 1600 470, 1800 510, 1920 530 L 1920 1080 L 0 1080 Z"
          fill="url(#hillFar)"
        />

        {/* Middle Hills with undulating curves */}
        <path
          d="M0 640 C 350 580, 680 500, 1050 560 C 1450 620, 1700 530, 1920 580 L 1920 1080 L 0 1080 Z"
          fill="url(#hillBack)"
        />

        {/* Foreground Main Iconic Bliss Hill */}
        <path
          d="M0 620 C 320 480, 720 430, 1100 540 C 1450 630, 1720 560, 1920 620 L 1920 1080 L 0 1080 Z"
          fill="url(#hillFront)"
        />

        {/* Sunlight Glow on Crest */}
        <path
          d="M 120 550 C 420 440, 780 430, 1080 530 C 800 480, 400 480, 120 550 Z"
          fill="#d8ff7a"
          opacity="0.35"
        />

        {/* Foreground Soft Warm Tint */}
        <ellipse cx="960" cy="1000" rx="1100" ry="300" fill="#4d8f1b" opacity="0.4" />
      </svg>
    </div>
  );
}
