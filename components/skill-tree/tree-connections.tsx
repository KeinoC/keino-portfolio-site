'use client'

import { motion, type Variants } from 'framer-motion'
import { Branch } from '@/types'
import { BRANCH_COLORS } from '@/lib/constants'

interface TreeConnectionsProps {
  branches: Branch[]
}

export default function TreeConnections({ branches }: TreeConnectionsProps) {
  const connectionVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5 },
        opacity: { duration: 0.3 }
      }
    }
  }

  const getPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    // Create curved connection
    const controlPoint1X = from.x + (to.x - from.x) * 0.3
    const controlPoint1Y = from.y
    const controlPoint2X = from.x + (to.x - from.x) * 0.7
    const controlPoint2Y = to.y

    return `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`
  }

  const connections = branches
    .filter(branch => branch.parentBranchId)
    .map(branch => {
      const parentBranch = branches.find(b => b.id === branch.parentBranchId)
      if (!parentBranch) return null

      return {
        id: `${parentBranch.id}-${branch.id}`,
        from: parentBranch.position,
        to: branch.position,
        fromType: parentBranch.type,
        toType: branch.type,
        isActive: branch.isActive
      }
    })
    .filter(Boolean)

  return (
    <g>
      {connections.map((connection, index) => {
        if (!connection) return null

        const fromColors = BRANCH_COLORS[connection.fromType as keyof typeof BRANCH_COLORS] || BRANCH_COLORS.other

        if (!fromColors) {
          return null
        }

        return (
          <g key={connection.id}>
            {/* Main connection line */}
            <motion.path
              variants={connectionVariants}
              initial="hidden"
              animate="visible"
              d={getPath(connection.from, connection.to)}
              stroke={`url(#gradient-${connection.fromType}-${connection.toType})`}
              strokeWidth={connection.isActive ? 3 : 2}
              fill="none"
              strokeLinecap="round"
              className="drop-shadow-sm"
              style={{
                filter: connection.isActive ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : undefined
              }}
            />

            {/* Connection glow */}
            {connection.isActive && fromColors?.primary && (
              <motion.path
                d={getPath(connection.from, connection.to)}
                stroke={fromColors.primary}
                strokeWidth={8}
                fill="none"
                opacity={0.3}
                strokeLinecap="round"
                animate={{
                  opacity: [0.1, 0.4, 0.1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5
                }}
              />
            )}

            {/* Data flow animation */}
            <motion.circle
              r={2}
              fill="#ffffff"
              opacity={0.8}
              animate={{
                offsetDistance: ["0%", "100%"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
                delay: index * 1
              }}
              style={{
                offsetPath: `path("${getPath(connection.from, connection.to)}")`,
                offsetRotate: "auto"
              }}
            />
          </g>
        )
      })}

      {/* Gradient definitions */}
      <defs>
        {connections.map(connection => {
          if (!connection) return null

          const fromColors = BRANCH_COLORS[connection.fromType as keyof typeof BRANCH_COLORS] || BRANCH_COLORS.other
          const toColors = BRANCH_COLORS[connection.toType as keyof typeof BRANCH_COLORS] || BRANCH_COLORS.other

          if (!fromColors || !toColors) return null

          return (
            <linearGradient
              key={`gradient-${connection.fromType}-${connection.toType}`}
              id={`gradient-${connection.fromType}-${connection.toType}`}
              x1="0%" y1="0%" x2="100%" y2="0%"
            >
              <stop offset="0%" stopColor={fromColors.primary} stopOpacity={0.8} />
              <stop offset="50%" stopColor={fromColors.secondary} stopOpacity={0.6} />
              <stop offset="100%" stopColor={toColors.primary} stopOpacity={0.8} />
            </linearGradient>
          )
        })}
      </defs>
    </g>
  )
}