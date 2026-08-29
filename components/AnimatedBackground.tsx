'use client';

// Edit these constants directly to change the look.
const BASE_COLOR = '#fff6ea';
const STRIPE_COLOR = '#80ff00';

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        overflow: 'hidden',
        backgroundColor: BASE_COLOR,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes bgDrift {
          from { transform: translate(0px, 0px); }
          to   { transform: translate(120px, 0px); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: -100,
          left: -100,
          right: -100,
          bottom: -100,
          backgroundImage: `repeating-linear-gradient(45deg, ${STRIPE_COLOR}33 0px, ${STRIPE_COLOR}33 4px, transparent 4px, transparent 34px)`,
          animation: 'bgDrift 4s linear infinite',
        }}
      />
    </div>
  );
}