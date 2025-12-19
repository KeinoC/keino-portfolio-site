'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Github, Linkedin } from 'lucide-react'
import { mockUser } from '@/lib/mock-data'

interface FormData {
  name: string
  email: string
  company?: string
  message: string
}

interface FormState {
  status: 'idle' | 'loading' | 'success' | 'error'
  message: string
}

export default function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const [formState, setFormState] = useState<FormState>({
    status: 'idle',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState({ status: 'loading', message: 'Sending message...' })

    try {
      // Simulate form submission - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500))

      // For now, just open email client with pre-filled data
      const subject = `Portfolio Contact: ${formData.name} ${formData.company ? `from ${formData.company}` : ''}`
      const body = `Name: ${formData.name}\nEmail: ${formData.email}\n${formData.company ? `Company: ${formData.company}\n` : ''}\n\nMessage:\n${formData.message}`

      window.location.href = `mailto:${mockUser.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      setFormState({
        status: 'success',
        message: 'Thank you! Your message has been sent. I\'ll get back to you soon.'
      })

      // Reset form
      setFormData({ name: '', email: '', company: '', message: '' })

    } catch {
      setFormState({
        status: 'error',
        message: 'Sorry, there was an error sending your message. Please try again or contact me directly.'
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6
      }
    }
  }

  const itemVariants = {
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

  return (
    <section id="contact" className="py-20 px-8 bg-slate-950/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Let&apos;s Connect
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Ready to bring unique financial insight and technical expertise to your team?
            Let&apos;s discuss how my background can add value to your organization.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Get In Touch</h3>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                I&apos;m always open to discussing new opportunities, interesting projects,
                or just connecting with fellow professionals. Whether you&apos;re looking for
                a developer with business acumen or want to explore potential collaborations,
                I&apos;d love to hear from you.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <motion.a
                href={`mailto:${mockUser.email}`}
                className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:bg-white/10 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    Email
                  </div>
                  <div className="text-slate-400">{mockUser.email}</div>
                </div>
              </motion.a>

              <motion.div
                className="flex items-center gap-4 p-4 glass-effect rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">Location</div>
                  <div className="text-slate-400">{mockUser.location}</div>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-4 p-4 glass-effect rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg text-white">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">Phone</div>
                  <div className="text-slate-400">347-679-1229</div>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-xl font-semibold text-white mb-4">Connect Online</h4>
              <div className="flex gap-4">
                {mockUser.linkedin && (
                  <motion.a
                    href={mockUser.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 glass-effect rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Linkedin className="w-7 h-7 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </motion.a>
                )}
                {mockUser.github && (
                  <motion.a
                    href={mockUser.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 glass-effect rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github className="w-7 h-7 text-slate-400 group-hover:text-white transition-colors" />
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <div className="glass-effect rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-slate-300 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 resize-vertical"
                    placeholder="Tell me about the opportunity, project, or just say hello..."
                  />
                </div>

                {/* Form Status */}
                {formState.status !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      formState.status === 'success'
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : formState.status === 'error'
                        ? 'bg-red-500/20 border border-red-500/30'
                        : 'bg-blue-500/20 border border-blue-500/30'
                    }`}
                  >
                    {formState.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {formState.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                    {formState.status === 'loading' && (
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className={`text-sm ${
                      formState.status === 'success'
                        ? 'text-emerald-300'
                        : formState.status === 'error'
                        ? 'text-red-300'
                        : 'text-blue-300'
                    }`}>
                      {formState.message}
                    </span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={formState.status === 'loading'}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  whileHover={{ scale: formState.status === 'loading' ? 1 : 1.02 }}
                  whileTap={{ scale: formState.status === 'loading' ? 1 : 0.98 }}
                >
                  {formState.status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}