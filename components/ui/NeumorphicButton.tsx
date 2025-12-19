'use client'

import { useState } from 'react'

interface NeumorphicButtonProps {
  children: React.ReactNode
  variant?: 'raised' | 'pressed' | 'flat'
  shape?: 'rounded' | 'circle' | 'pill'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function NeumorphicButton({
  children,
  variant = 'raised',
  shape = 'rounded',
  size = 'md',
  onClick
}: NeumorphicButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const baseStyles = `
    bg-[#e0e5ec]
    transition-all duration-150 ease-out
    select-none cursor-pointer
    flex items-center justify-center
    text-[#6b7280] font-medium
  `

  const sizeStyles = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-lg'
  }

  const shapeStyles = {
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
    pill: 'rounded-full px-8 w-auto'
  }

  // Neumorphic shadow styles
  const raisedShadow = `
    shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.8)]
  `

  const pressedShadow = `
    shadow-[inset_6px_6px_10px_rgba(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.8)]
  `

  const flatShadow = `
    shadow-[6px_6px_12px_rgba(163,177,198,0.5),-6px_-6px_12px_rgba(255,255,255,0.7)]
  `

  const getShadow = () => {
    if (isPressed) return pressedShadow
    switch (variant) {
      case 'raised': return raisedShadow
      case 'pressed': return pressedShadow
      case 'flat': return flatShadow
      default: return raisedShadow
    }
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${shapeStyles[shape]} ${getShadow()}`}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Demo component to test different variants
export function NeumorphicDemo() {
  return (
    <div className="min-h-screen bg-[#e0e5ec] p-12 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[#5a6070] mb-4">Neumorphic Buttons</h1>

      {/* Row 1: Squares */}
      <div className="flex gap-6 items-center">
        <NeumorphicButton shape="rounded" size="lg">
          <span className="text-2xl">+</span>
        </NeumorphicButton>
        <NeumorphicButton shape="rounded" size="md">
          <span className="text-xl">A</span>
        </NeumorphicButton>
        <NeumorphicButton variant="pressed" shape="rounded" size="md">
          <span className="text-xl">B</span>
        </NeumorphicButton>
        <NeumorphicButton shape="rounded" size="sm">
          <span>C</span>
        </NeumorphicButton>
      </div>

      {/* Row 2: Circles */}
      <div className="flex gap-6 items-center">
        <NeumorphicButton shape="circle" size="lg">
          <span className="text-2xl">O</span>
        </NeumorphicButton>
        <NeumorphicButton shape="circle" size="md">
          <span className="text-xl">P</span>
        </NeumorphicButton>
        <NeumorphicButton variant="pressed" shape="circle" size="md">
          <span className="text-xl">Q</span>
        </NeumorphicButton>
        <NeumorphicButton shape="circle" size="sm">
          <span>R</span>
        </NeumorphicButton>
      </div>

      {/* Row 3: Pills */}
      <div className="flex gap-6 items-center flex-wrap">
        <NeumorphicButton shape="pill" size="md">
          <span className="px-4">Button</span>
        </NeumorphicButton>
        <NeumorphicButton variant="pressed" shape="pill" size="md">
          <span className="px-4">Active</span>
        </NeumorphicButton>
        <NeumorphicButton shape="pill" size="sm">
          <span className="px-3 text-xs">Small</span>
        </NeumorphicButton>
      </div>

      {/* Row 4: Inset / Groove */}
      <div className="flex gap-6 items-center">
        <div className="w-48 h-4 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_6px_rgba(163,177,198,0.6),inset_-4px_-4px_6px_rgba(255,255,255,0.8)]" />
        <div className="w-32 h-3 rounded-full bg-[#e0e5ec] shadow-[inset_3px_3px_5px_rgba(163,177,198,0.6),inset_-3px_-3px_5px_rgba(255,255,255,0.8)]" />
      </div>

      {/* Slider example */}
      <div className="relative w-64">
        <div className="w-full h-2 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]" />
        <div
          className="absolute top-1/2 -translate-y-1/2 left-[30%] w-5 h-5 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.8)] cursor-pointer"
        />
      </div>
    </div>
  )
}

export default NeumorphicButton
