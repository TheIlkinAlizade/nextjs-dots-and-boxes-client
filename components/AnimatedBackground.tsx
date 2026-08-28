export default function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundColor: '#fffbf5',
        backgroundImage: 'radial-gradient(rgba(20, 20, 20, 0.89) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        animation: 'drift 25s linear infinite',
      }}
    />
  );
}