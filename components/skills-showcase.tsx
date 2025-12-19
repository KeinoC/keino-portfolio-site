'use client'

import { motion } from 'framer-motion'
import { mockSkills } from '@/lib/mock-data'
import { Code, Database, Cloud, Palette, Users, TrendingUp } from 'lucide-react'

const skillCategories = {
  Frontend: {
    icon: <Code className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    description: 'Modern UI/UX Development'
  },
  Backend: {
    icon: <Database className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-500',
    description: 'Server-side Architecture'
  },
  Database: {
    icon: <Database className="w-6 h-6" />,
    color: 'from-purple-500 to-violet-500',
    description: 'Data Management & Storage'
  },
  Cloud: {
    icon: <Cloud className="w-6 h-6" />,
    color: 'from-orange-500 to-amber-500',
    description: 'Cloud Infrastructure'
  },
  Language: {
    icon: <Code className="w-6 h-6" />,
    color: 'from-red-500 to-pink-500',
    description: 'Programming Languages'
  },
  Design: {
    icon: <Palette className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-500',
    description: 'UI/UX Design Tools'
  },
  'Project Management': {
    icon: <Users className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
    description: 'Agile & Team Collaboration'
  },
  Business: {
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-500',
    description: 'Financial Analysis & Strategy'
  },
  DevOps: {
    icon: <Cloud className="w-6 h-6" />,
    color: 'from-gray-500 to-slate-500',
    description: 'Deployment & Infrastructure'
  }
}

const getSkillLevelInfo = (level: string) => {
  switch (level) {
    case 'expert':
      return { width: '90%', color: 'bg-emerald-500', label: 'Expert' }
    case 'advanced':
      return { width: '75%', color: 'bg-blue-500', label: 'Advanced' }
    case 'intermediate':
      return { width: '60%', color: 'bg-yellow-500', label: 'Intermediate' }
    default:
      return { width: '40%', color: 'bg-gray-500', label: 'Beginner' }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6
    }
  }
}

const categoryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

const skillVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

export default function SkillsShowcase() {
  const groupedSkills = mockSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof mockSkills>)

  // Sort skills within each category by level and experience
  Object.keys(groupedSkills).forEach(category => {
    groupedSkills[category].sort((a, b) => {
      const levelOrder = { expert: 3, advanced: 2, intermediate: 1, beginner: 0 }
      return (levelOrder[b.level as keyof typeof levelOrder] || 0) - (levelOrder[a.level as keyof typeof levelOrder] || 0) ||
             b.yearsExperience - a.yearsExperience
    })
  })

  return (
    <section id="skills" className="py-20 px-8 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Technical Expertise
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A comprehensive skill set spanning modern development technologies,
            cloud infrastructure, and business analysis - combining technical depth with strategic insight.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {Object.entries(groupedSkills).map(([category, skills]) => {
            const categoryInfo = skillCategories[category as keyof typeof skillCategories] || {
              icon: <Code className="w-6 h-6" />,
              color: 'from-gray-500 to-slate-500',
              description: 'Technical Skills'
            }

            return (
              <motion.div
                key={category}
                variants={categoryVariants}
                className="glass-effect rounded-2xl p-8 hover:bg-white/5 transition-all duration-500 group"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryInfo.color} text-white shadow-lg`}>
                    {categoryInfo.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      {category}
                    </h3>
                    <p className="text-sm text-slate-400">{categoryInfo.description}</p>
                  </div>
                </div>

                {/* Skills List */}
                <div className="space-y-4">
                  {skills.map((skill, index) => {
                    const levelInfo = getSkillLevelInfo(skill.level)

                    return (
                      <motion.div
                        key={skill.id}
                        variants={skillVariants}
                        className="space-y-2"
                      >
                        {/* Skill Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-slate-200">
                              {skill.name}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelInfo.color} text-white`}>
                              {levelInfo.label}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">
                            {skill.yearsExperience}y
                          </div>
                        </div>

                        {/* Skill Level Bar */}
                        <div className="relative">
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${levelInfo.color} rounded-full relative`}
                              initial={{ width: 0 }}
                              whileInView={{ width: levelInfo.width }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 1,
                                delay: index * 0.1,
                                ease: [0.25, 0.46, 0.45, 0.94] as const
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Category Stats */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{skills.length} Technologies</span>
                    <span>
                      {Math.round(skills.reduce((sum, skill) => sum + skill.yearsExperience, 0) / skills.length)}y Avg Experience
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Skills Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {mockSkills.filter(s => s.level === 'expert').length}
            </div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Expert Level</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {mockSkills.filter(s => s.level === 'advanced').length}
            </div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Advanced</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Object.keys(groupedSkills).length}
            </div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Categories</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-indigo-400 mb-2">
              {Math.max(...mockSkills.map(s => s.yearsExperience))}
            </div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Max Experience</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}