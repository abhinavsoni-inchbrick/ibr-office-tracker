interface ProgressBarProps {
  value: number
  className?: string
  barClassName?: string
}

export function ProgressBar({
  value,
  className = '',
  barClassName = 'bg-accent',
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-ink-100 ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
