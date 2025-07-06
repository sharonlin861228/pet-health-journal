'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, defaultChecked, disabled, className, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || false)
    const isControlled = checked !== undefined
    const currentChecked = isControlled ? checked : isChecked

    const handleToggle = () => {
      if (disabled) return
      
      const newValue = !currentChecked
      if (!isControlled) {
        setIsChecked(newValue)
      }
      onCheckedChange?.(newValue)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={currentChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          currentChecked ? 'bg-blue-500' : 'bg-gray-200',
          className
        )}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
            currentChecked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch } 