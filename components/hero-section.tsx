'use client'

import { motion, type Variants } from 'framer-motion'
import { GitBranch, Linkedin, Mail, MapPin, ChevronDown } from 'lucide-react'
import { mockUser } from '@/lib/mock-data'

export default function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.8
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  const scrollToSkillTree = () => {
    document.getElementById('skill-tree')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToExperience = () => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative px-8 py-20 overflow-hidden">
      {/* Enhanced background with professional gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/30 to-indigo-950/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

      {/* Subtle animated grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      {/* Professional floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full"
            animate={{
              x: [Math.random() * 100, Math.random() * 100 + 50],
              y: [Math.random() * 100, Math.random() * 100 + 50],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto relative z-10"
      >
        {/* Professional Header Section */}
        <div className="text-center mb-12">
          {/* Refined Avatar */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                className="w-36 h-36 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full p-[3px]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(59, 130, 246, 0.3)',
                    '0 0 30px rgba(99, 102, 241, 0.4)',
                    '0 0 20px rgba(59, 130, 246, 0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-4xl font-bold text-white border border-slate-700">
                  KC
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Name with Professional Typography */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight"
          >
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {mockUser.name}
            </span>
          </motion.h1>

          {/* Professional Title with Enhanced Animation */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <motion.h2
              className="text-2xl md:text-3xl font-semibold text-slate-200 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {mockUser.title}
            </motion.h2>
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
            />
          </motion.div>

          {/* Enhanced Bio with Better Readability */}
          <motion.div
            variants={itemVariants}
            className="max-w-4xl mx-auto mb-12"
          >
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
              <span className="text-blue-400 font-medium">Software Engineer</span> with{' '}
              <span className="text-emerald-400 font-medium">8+ years</span> of Financial Planning and Analysis experience in healthcare.
              <br />
              <span className="text-slate-400">
                Trained at Flatiron School, I excel at crafting innovative solutions that exceed expectations.
              </span>
            </p>
          </motion.div>
        </div>

        {/* Professional Stats Bar */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
        >
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-blue-400 mb-2">8+</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Years Finance</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-400 mb-2">2+</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Years Dev</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-purple-400 mb-2">5+</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Companies</div>
          </div>
          <div className="text-center glass-effect rounded-xl p-6 hover:bg-white/5 transition-all duration-300">
            <div className="text-3xl font-bold text-indigo-400 mb-2">20+</div>
            <div className="text-sm text-slate-400 uppercase tracking-wide">Technologies</div>
          </div>
        </motion.div>

        {/* Location and Availability */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-8 mb-12 text-slate-300"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className="font-medium">{mockUser.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-medium">Available for Opportunities</span>
          </div>
        </motion.div>

        {/* Professional Social Links */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-6 mb-12"
        >
          {mockUser.github && (
            <motion.a
              href={mockUser.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl glass-effect hover:bg-white/10 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <GitBranch className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
            </motion.a>
          )}

          {mockUser.linkedin && (
            <motion.a
              href={mockUser.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl glass-effect hover:bg-white/10 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-7 h-7 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </motion.a>
          )}

          <motion.a
            href={`mailto:${mockUser.email}`}
            className="p-4 rounded-xl glass-effect hover:bg-white/10 transition-all duration-300 group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-7 h-7 text-slate-400 group-hover:text-purple-400 transition-colors" />
          </motion.a>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
        >
          <motion.button
            onClick={scrollToExperience}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-3 justify-center group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            View My Experience
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.button>

          <motion.button
            onClick={scrollToSkillTree}
            className="px-10 py-4 glass-effect rounded-full text-slate-200 font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center gap-3 justify-center border border-slate-600"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Explore Tech Stack
          </motion.button>

          <motion.a
            href={`mailto:${mockUser.email}`}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center gap-3 justify-center"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Let&apos;s Connect
          </motion.a>
        </motion.div>

        {/* Professional Scroll Indicator */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <span className="text-sm text-slate-500 mb-4 font-medium tracking-wide">SCROLL TO EXPLORE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="cursor-pointer"
            onClick={scrollToExperience}
          >
            <ChevronDown className="w-6 h-6 text-slate-400 hover:text-white transition-colors" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}