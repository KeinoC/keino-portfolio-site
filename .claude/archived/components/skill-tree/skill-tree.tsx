'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import TreeNode from './tree-node'
import TreeConnections from './tree-connections'
import { mockBranches, mockCommits } from '@/lib/mock-data'
import { Branch, Commit } from '@/types'
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react'

interface SkillTreeProps {
  onNodeSelect?: (node: Branch | Commit, type: 'branch' | 'commit') => void
}

export default function SkillTree({ onNodeSelect }: SkillTreeProps) {
  const [selectedNode, setSelectedNode] = useState<{ id: string; type: 'branch' | 'commit' } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const viewBox = useMemo(() => {
    const padding = 100
    const minX = Math.min(...mockBranches.map(b => b.position.x)) - padding
    const maxX = Math.max(...mockBranches.map(b => b.position.x)) + padding
    const minY = Math.min(...mockBranches.map(b => b.position.y)) - padding
    const maxY = Math.max(...mockBranches.map(b => b.position.y)) + padding

    return {
      x: minX + pan.x,
      y: minY + pan.y,
      width: (maxX - minX) / zoom,
      height: (maxY - minY) / zoom
    }
  }, [zoom, pan])

  const handleNodeClick = useCallback((data: Branch | Commit, type: 'branch' | 'commit') => {
    setSelectedNode({ id: data.id, type })
    onNodeSelect?.(data, type)
  }, [onNodeSelect])

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <section id="skill-tree" className="min-h-screen py-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Career Evolution Tree
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
            An interactive visualization of my professional journey - from financial analysis foundations
            through software engineering transformation. Each branch represents a career phase,
            with commits highlighting key projects and achievements that shaped my unique skill set.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
              <span>Financial Foundation (2015-2023)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded"></div>
              <span>Education & Transition (2023)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
              <span>Software Engineering (2023-Present)</span>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex gap-2 glass-effect rounded-full p-2">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Reset view"
            >
              <RotateCcw className="w-5 h-5 text-gray-400" />
            </button>
            <div className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Click nodes to explore
            </div>
          </div>
        </motion.div>

        {/* Tree visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative overflow-hidden rounded-2xl glass-effect min-h-[600px] cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          >
            {/* Background grid */}
            <defs>
              <pattern
                id="grid"
                width={50}
                height={50}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              x={viewBox.x}
              y={viewBox.y}
              width={viewBox.width}
              height={viewBox.height}
              fill="url(#grid)"
            />

            {/* Connections */}
            <TreeConnections branches={mockBranches} />

            {/* Branch nodes */}
            {mockBranches.map((branch, index) => (
              <TreeNode
                key={branch.id}
                data={branch}
                type="branch"
                x={branch.position.x}
                y={branch.position.y}
                isSelected={selectedNode?.id === branch.id && selectedNode?.type === 'branch'}
                onClick={() => handleNodeClick(branch, 'branch')}
                index={index}
              />
            ))}

            {/* Commit nodes */}
            {mockCommits.map((commit, index) => (
              <TreeNode
                key={commit.id}
                data={commit}
                type="commit"
                x={commit.x}
                y={commit.y}
                isSelected={selectedNode?.id === commit.id && selectedNode?.type === 'commit'}
                onClick={() => handleNodeClick(commit, 'commit')}
                index={mockBranches.length + index}
              />
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-effect rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Branch (Technology Domain)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Commit (Achievement)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">High Impact</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Currently Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          <div className="text-center glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold gradient-text mb-2">{mockBranches.length}</div>
            <div className="text-sm text-gray-400">Technology Domains</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold gradient-text mb-2">{mockCommits.length}</div>
            <div className="text-sm text-gray-400">Major Achievements</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold gradient-text mb-2">
              {mockBranches.filter(b => b.isActive).length}
            </div>
            <div className="text-sm text-gray-400">Active Projects</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6">
            <div className="text-3xl font-bold gradient-text mb-2">
              {mockCommits.filter(c => c.impact === 'high').length}
            </div>
            <div className="text-sm text-gray-400">High Impact</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}