export const BRANCH_COLORS = {
  frontend: {
    primary: '#3B82F6', // blue-500
    secondary: '#93C5FD', // blue-300
    accent: '#1E40AF', // blue-800
    gradient: 'from-blue-400 to-blue-600'
  },
  backend: {
    primary: '#10B981', // emerald-500
    secondary: '#86EFAC', // emerald-300
    accent: '#047857', // emerald-700
    gradient: 'from-emerald-400 to-emerald-600'
  },
  devops: {
    primary: '#F59E0B', // amber-500
    secondary: '#FCD34D', // amber-300
    accent: '#B45309', // amber-700
    gradient: 'from-amber-400 to-amber-600'
  },
  mobile: {
    primary: '#8B5CF6', // violet-500
    secondary: '#C4B5FD', // violet-300
    accent: '#6D28D9', // violet-700
    gradient: 'from-violet-400 to-violet-600'
  },
  ai_ml: {
    primary: '#EC4899', // pink-500
    secondary: '#F9A8D4', // pink-300
    accent: '#BE185D', // pink-700
    gradient: 'from-pink-400 to-pink-600'
  },
  cloud: {
    primary: '#06B6D4', // cyan-500
    secondary: '#67E8F9', // cyan-300
    accent: '#0E7490', // cyan-700
    gradient: 'from-cyan-400 to-cyan-600'
  },
  design: {
    primary: '#F97316', // orange-500
    secondary: '#FDBA74', // orange-300
    accent: '#C2410C', // orange-700
    gradient: 'from-orange-400 to-orange-600'
  },
  business: {
    primary: '#F59E0B', // amber-500
    secondary: '#FCD34D', // amber-300
    accent: '#B45309', // amber-700
    gradient: 'from-amber-400 to-amber-600'
  },
  education: {
    primary: '#8B5CF6', // violet-500
    secondary: '#C4B5FD', // violet-300
    accent: '#6D28D9', // violet-700
    gradient: 'from-violet-400 to-violet-600'
  },
  fullstack: {
    primary: '#06B6D4', // cyan-500
    secondary: '#67E8F9', // cyan-300
    accent: '#0E7490', // cyan-700
    gradient: 'from-cyan-400 to-cyan-600'
  },
  other: {
    primary: '#6B7280', // gray-500
    secondary: '#D1D5DB', // gray-300
    accent: '#374151', // gray-700
    gradient: 'from-gray-400 to-gray-600'
  }
} as const

export const SKILL_LEVELS = {
  beginner: { label: 'Beginner', color: 'text-gray-500', bgColor: 'bg-gray-100' },
  intermediate: { label: 'Intermediate', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  advanced: { label: 'Advanced', color: 'text-purple-500', bgColor: 'bg-purple-100' },
  expert: { label: 'Expert', color: 'text-green-500', bgColor: 'bg-green-100' }
} as const