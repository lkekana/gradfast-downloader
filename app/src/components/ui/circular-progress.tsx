import type * as React from "react"
import { cn } from "@/lib/utils"
import { Pause } from "lucide-react"

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
}

export function CircularProgress({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  className,
  ...props
}: CircularProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = (clampedValue / max) * 100
  
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("relative inline-flex items-center justify-center animate-pulse", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <title>{`Download Progress: ${Math.round(percentage)}%`}</title>
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted fill-none"
        />
        {/* Progress Indicator */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="stroke-primary fill-none transition-all duration-300 ease-in-out"
        />
      </svg>
      {/* <span className="absolute text-xs font-semibold">
        {Math.round(percentage)}%
      </span> */}
    </div>
  )
}
