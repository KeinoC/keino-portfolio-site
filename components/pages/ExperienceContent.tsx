'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface ExperienceContentProps {
  expanded: boolean
  onToggle: () => void
}

const TIMELINE = [
  {
    role: 'Software Engineer',
    org: 'Freelance / Independent',
    period: 'Current',
    description: 'Fullstack products: fintech MVPs, property platforms, UI libraries, 3D portfolio.',
  },
  {
    role: 'Software Engineering Program',
    org: 'Flatiron School',
    period: '',
    description: 'Career pivot from finance to code.',
  },
  {
    role: 'Healthcare Finance',
    org: '8 Years',
    period: '',
    description: 'Financial modeling, process automation, systems thinking.',
  },
]

export function ExperienceContent({ expanded, onToggle }: ExperienceContentProps) {
  return (
    <div
      className="select-none cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
    >
      {/* Layer 1 — Summary (always visible on settle) */}
      <h2 className="text-base font-light tracking-[0.2em] uppercase text-white/85 mb-0.5">
        Experience
      </h2>
      <p className="text-[11px] tracking-[0.15em] uppercase text-white/40 mb-3">
        Software Engineer
      </p>
      <p className="text-[13px] leading-relaxed text-white/55">
        From finance to fullstack — building across the entire stack.
      </p>

      {/* Layer 2 — Timeline (expand on click) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-l border-white/10 ml-1 pl-3 space-y-3">
              {TIMELINE.map((entry) => (
                <div key={entry.role}>
                  <p className="text-[13px] font-medium text-white/70 leading-tight">
                    {entry.role}
                  </p>
                  <p className="text-[11px] tracking-wider uppercase text-white/35 mt-0.5">
                    {entry.org}{entry.period ? ` · ${entry.period}` : ''}
                  </p>
                  <p className="text-[12px] leading-relaxed text-white/45 mt-1">
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <p className="text-[9px] uppercase tracking-[0.15em] text-white/20 mt-2">
          tap to read more
        </p>
      )}
    </div>
  )
}
