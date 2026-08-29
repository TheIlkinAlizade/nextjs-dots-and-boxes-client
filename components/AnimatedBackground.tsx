// Edit these two constants directly to change the look — no UI control by design.
const BASE_COLOR = '#14120F';
const STRIPE_COLOR = '#81B64C';

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: BASE_COLOR }} aria-hidden>
      <style>{`
        @keyframes bgDrift {
          from { transform: translate(0, 0); }
          to { transform: translate(-60px, -60px); }
        }
      `}</style>
      <div
        className="absolute -inset-[60px]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${STRIPE_COLOR}22 0px, ${STRIPE_COLOR}22 3px, transparent 3px, transparent 30px)`,
          animation: 'bgDrift 6s linear infinite',
        }}
      />
    </div>
  );
}