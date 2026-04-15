'use client'

import { motion, type Variants } from 'framer-motion'
import { Commit, Branch } from '@/types'
import { BRANCH_COLORS } from '@/lib/constants'

interface TreeNodeProps {
  data: Commit | Branch
  type: 'commit' | 'branch'
  x: number
  y: number
  isSelected?: boolean
  onClick?: () => void
  index?: number
}

export default function TreeNode({
  data,
  type,
  x,
  y,
  isSelected = false,
  onClick,
  index = 0
}: TreeNodeProps) {
  const isCommit = type === 'commit'
  const commitData = data as Commit
  const branchData = data as Branch

  // Get the correct branch type
  let branchType: keyof typeof BRANCH_COLORS = 'other'

  if (isCommit) {
    // For commits, derive branch type from branchId
    const commit = commitData as Commit
    if (commit.branchId?.includes('frontend')) branchType = 'frontend'
    else if (commit.branchId?.includes('backend')) branchType = 'backend'
    else if (commit.branchId?.includes('devops')) branchType = 'devops'
    else if (commit.branchId?.includes('ai')) branchType = 'ai_ml'
    else branchType = 'other'
  } else {
    branchType = (branchData as Branch).type || 'other'
  }

  const colors = BRANCH_COLORS[branchType]

  const nodeVariants: Variants = {
    hidden: {
      scale: 0,
      opacity: 0,
      y: y + 50
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: y,
      transition: {
        delay: index * 0.1,
        duration: 0.6
      }
    }
  }

  const hoverVariants: Variants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }

  if (isCommit) {
    return (
      <motion.g
        variants={nodeVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <motion.circle
          variants={hoverVariants}
          cx={x}
          cy={y}
          r={isSelected ? 12 : 8}
          fill={colors.primary}
          stroke={isSelected ? '#ffffff' : colors.accent}
          strokeWidth={isSelected ? 3 : 2}
          className="drop-shadow-lg"
        />

        {/* Glow effect */}
        <motion.circle
          cx={x}
          cy={y}
          r={isSelected ? 20 : 16}
          fill={colors.primary}
          opacity={isSelected ? 0.3 : 0.1}
          animate={{
            r: isSelected ? [16, 24, 16] : [12, 18, 12],
            opacity: isSelected ? [0.3, 0.1, 0.3] : [0.1, 0.05, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Impact indicator */}
        {commitData.impact === 'high' && (
          <motion.circle
            cx={x + 15}
            cy={y - 10}
            r={4}
            fill="#fbbf24"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.g>
    )
  }

  // Branch node
  return (
    <motion.g
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <motion.rect
        variants={hoverVariants}
        x={x - (isSelected ? 25 : 20)}
        y={y - (isSelected ? 15 : 12)}
        width={isSelected ? 50 : 40}
        height={isSelected ? 30 : 24}
        rx={8}
        fill={colors.primary}
        stroke={isSelected ? '#ffffff' : colors.accent}
        strokeWidth={isSelected ? 3 : 2}
        className="drop-shadow-lg"
      />

      {/* Branch glow */}
      <motion.rect
        x={x - 35}
        y={y - 20}
        width={70}
        height={40}
        rx={12}
        fill={colors.primary}
        opacity={isSelected ? 0.2 : 0.08}
        animate={{
          width: isSelected ? [60, 80, 60] : [50, 70, 50],
          height: isSelected ? [35, 45, 35] : [30, 40, 30]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Active indicator */}
      {branchData.isActive && (
        <motion.circle
          cx={x + 22}
          cy={y - 15}
          r={3}
          fill="#10b981"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Branch icon */}
      <text
        x={x}
        y={y + 2}
        textAnchor="middle"
        className="fill-white text-xs font-bold select-none"
      >
        {branchData.name.substring(0, 2).toUpperCase()}
      </text>
    </motion.g>
  )
}