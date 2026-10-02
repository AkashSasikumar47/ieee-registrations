export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display block leading-[0.78] font-black tracking-[-0.055em] whitespace-nowrap uppercase ${className}`}
    >
      <span className="text-primary">IEEE</span> Registrations
    </span>
  );
}
