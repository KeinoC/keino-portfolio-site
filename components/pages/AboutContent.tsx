'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface AboutContentProps {
  expanded: boolean
  onToggle: () => void
}

const SKILLS = [
  'Next.js', 'TypeScript', 'React', 'R3F',
  'Node.js', 'PostgreSQL', 'Prisma', 'AWS',
]

export function AboutContent({ expanded, onToggle }: AboutContentProps) {
  return (
    <div
      className="select-none cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
    >
      {/* Layer 1 — Key facts (always visible on settle) */}
      <h2 className="text-base font-light tracking-[0.2em] uppercase text-white/85 mb-0.5">
        Keino Chichester
      </h2>
      <p className="text-[11px] tracking-[0.15em] uppercase text-white/40 mb-3">
        Software Engineer — Brooklyn, NY
      </p>
      <p className="text-[13px] leading-relaxed text-white/55">
        From financial models to fullstack products.{' '}
        Eight years of building systems — first in spreadsheets, now in code.
      </p>

      {/* Layer 2 — Bio + skills (expand on click) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <p className="text-[13px] leading-relaxed text-white/45 mb-2.5">
                Started in healthcare finance — eight years of building
                complex models in Excel. Automated so much of the work that
                the obvious next step was learning to code for real. Flatiron
                School, then into fullstack engineering.
              </p>
              <p className="text-[13px] leading-relaxed text-white/45 mb-3">
                Now I ship end-to-end: fintech MVPs, property platforms,
                UI component libraries, and this 3D portfolio. The finance
                background means I think in systems, constraints, and trade-offs.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {SKILLS.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-white/10 text-white/35"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <p className="text-[10px] tracking-[0.15em] uppercase text-white/30 mb-1">
                Outside Code
              </p>
              <p className="text-[12px] text-white/40">
                Woodworking, metalwork, carpentry — I build things.
              </p>
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
