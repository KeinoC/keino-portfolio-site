'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

/**
 * GlassCard - Apple-style glassmorphism card component
 *
 * Features:
 * - Frosted glass effect with backdrop blur
 * - Semi-transparent background
 * - Subtle border simulating glass edge
 * - Optional hover effects
 *
 * Based on Apple's Liquid Glass design system
 * @see https://ui.glass/generator/
 */

export type GlassVariant = 'light' | 'dark' | 'subtle'

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: GlassVariant
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  children: React.ReactNode
}

const blurValues = {
  sm: 'backdrop-blur-sm',    // 4px
  md: 'backdrop-blur-md',    // 12px
  lg: 'backdrop-blur-lg',    // 16px
  xl: 'backdrop-blur-xl',    // 24px
}

const variantStyles: Record<GlassVariant, {
  bg: string
  border: string
  shadow: string
  hoverBg?: string
}> = {
  light: {
    bg: 'bg-white/20',
    border: 'border border-white/30',
    shadow: 'shadow-lg shadow-black/5',
    hoverBg: 'hover:bg-white/30',
  },
  dark: {
    bg: 'bg-black/10',
    border: 'border border-black/10',
    shadow: 'shadow-lg shadow-black/10',
    hoverBg: 'hover:bg-black/15',
  },
  subtle: {
    bg: 'bg-white/10',
    border: 'border border-white/20',
    shadow: 'shadow-md shadow-black/5',
    hoverBg: 'hover:bg-white/15',
  },
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      variant = 'light',
      blur = 'lg',
      interactive = false,
      children,
      className = '',
      ...props
    },
    ref
  ) {
    const styles = variantStyles[variant]

    return (
      <motion.div
        ref={ref}
        className={`
          rounded-2xl
          ${blurValues[blur]}
          ${styles.bg}
          ${styles.border}
          ${styles.shadow}
          ${interactive ? `${styles.hoverBg} transition-colors cursor-pointer` : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

/**
 * GlassButton - Interactive glass-style button
 */
export interface GlassButtonProps extends Omit<HTMLMotionProps<'a'>, 'ref'> {
  variant?: GlassVariant
  icon?: React.ReactNode
  title: string
  subtitle?: string
  href?: string
}

export const GlassButton = forwardRef<HTMLAnchorElement, GlassButtonProps>(
  function GlassButton(
    {
      variant = 'light',
      icon,
      title,
      subtitle,
      href,
      className = '',
      ...props
    },
    ref
  ) {
    const isLight = variant === 'light' || variant === 'subtle'

    return (
      <motion.a
        ref={ref}
        href={href}
        className={`
          flex items-center gap-3 px-3 py-2.5
          rounded-lg
          backdrop-blur-md
          bg-white/15
          border border-white/25
          shadow-sm
          hover:bg-white/25
          hover:border-white/40
          hover:shadow-md
          hover:shadow-black/10
          transition-all duration-200
          cursor-pointer
          group
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {icon && (
          <span className={`text-lg ${isLight ? 'text-gray-600 group-hover:text-gray-800' : 'text-white/70 group-hover:text-white'} transition-colors`}>
            {icon}
          </span>
        )}
        <div>
          <p className={`
            text-sm font-medium transition-colors
            ${isLight
              ? 'text-gray-700 group-hover:text-gray-900'
              : 'text-white/80 group-hover:text-white'
            }
          `}>
            {title}
          </p>
          {subtitle && (
            <p className={`text-xs ${isLight ? 'text-gray-400 group-hover:text-gray-500' : 'text-white/40'} transition-colors`}>
              {subtitle}
            </p>
          )}
        </div>
      </motion.a>
    )
  }
)

export default GlassCard
