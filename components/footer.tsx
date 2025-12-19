'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ExternalLink, Heart } from 'lucide-react'
import { mockUser } from '@/lib/mock-data'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <motion.button
              onClick={scrollToTop}
              className="text-2xl font-bold gradient-text bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-500 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              {mockUser.name}
            </motion.button>
            <p className="text-slate-400 text-sm leading-relaxed">
              Full Stack Software Engineer with 8+ years of financial analysis experience.
              Bridging business insight with technical innovation to create exceptional solutions.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Available for new opportunities
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <nav className="space-y-2">
              <button
                onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Experience
              </button>
              <button
                onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Skills
              </button>
              <button
                onClick={() => document.getElementById('skill-tree')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Career Evolution
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Connect</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${mockUser.email}`}
                className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm group"
              >
                <Mail className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                {mockUser.email}
              </a>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-4 h-4 flex items-center justify-center">📍</div>
                {mockUser.location}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              {mockUser.github && (
                <motion.a
                  href={mockUser.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 glass-effect rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </motion.a>
              )}
              {mockUser.linkedin && (
                <motion.a
                  href={mockUser.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 glass-effect rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </motion.a>
              )}
              {mockUser.website && (
                <motion.a
                  href={mockUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 glass-effect rounded-lg hover:bg-white/10 transition-all duration-300 group"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </motion.a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>© {currentYear} {mockUser.name}.</span>
              <span>Built with</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>using Next.js, TypeScript & Tailwind CSS</span>
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
              whileHover={{ y: -2 }}
            >
              <span>Back to top</span>
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ↑
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Tech Stack Credits */}
        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <div className="text-center">
            <div className="text-xs text-slate-600 mb-2">Built with modern technologies</div>
            <div className="flex flex-wrap justify-center gap-3 text-xs">
              <span className="px-2 py-1 bg-slate-800/30 rounded text-slate-500">Next.js 15</span>
              <span className="px-2 py-1 bg-slate-800/30 rounded text-slate-500">TypeScript</span>
              <span className="px-2 py-1 bg-slate-800/30 rounded text-slate-500">Tailwind CSS</span>
              <span className="px-2 py-1 bg-slate-800/30 rounded text-slate-500">Framer Motion</span>
              <span className="px-2 py-1 bg-slate-800/30 rounded text-slate-500">Lucide Icons</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}